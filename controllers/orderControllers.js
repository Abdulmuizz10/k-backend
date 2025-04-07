import OrderModel from "../models/orderModel.js";
import { Client, Environment } from "square";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import { sendOrderConfirmationEmail } from "../lib/utils.js";
dotenv.config();

function convertBigIntToString(obj) {
  if (typeof obj === "bigint") {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntToString(value),
      ])
    );
  }
  return obj;
}

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

const paymentsApi = squareClient.paymentsApi;

const createOrderController = async (req, res) => {
  try {
    const {
      sourceId,
      totalPrice,
      currency,
      orderedItems,
      billingAddress,
      shippingAddress,
      email,
    } = req.body;

    // Validate required fields
    if (!sourceId || !totalPrice || !currency || !orderedItems || !email) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const address = billingAddress || shippingAddress;
    if (
      !address ||
      !address.zipCode ||
      !address.addressLineOne ||
      !address.country ||
      !address.state
    ) {
      return res
        .status(400)
        .json({ message: "Address fields are incomplete." });
    }

    let paymentResult;
    try {
      const { result } = await paymentsApi.createPayment({
        sourceId,
        amountMoney: {
          currency,
          amount: parseInt(Math.floor(Number(totalPrice) * 100), 10),
        },
        idempotencyKey: crypto.randomUUID(),
        locationId: process.env.SQUARE_LOCATION_ID,
        billingAddress: {
          postalCode: address.zipCode,
          addressLine1: address.addressLineOne,
          administrativeDistrictLevel1: address.state,
          country: address.country,
        },
        buyerEmailAddress: email,
      });

      if (!result) {
        return res.status(400).json({ message: "Payment result is invalid." });
      }

      paymentResult = convertBigIntToString(result);
    } catch (paymentError) {
      return res.status(500).json({
        message: "Payment processing failed.",
        error: paymentError.message,
      });
    }

    try {
      const order = new OrderModel(req.body);
      const savedOrder = await order.save();

      await sendOrderConfirmationEmail(
        email,
        shippingAddress.firstName,
        shippingAddress.lastName,
        totalPrice,
        currency,
        orderedItems,
        savedOrder._id
      );

      return res.status(200).json({ ...savedOrder.toObject(), paymentResult });
    } catch (orderError) {
      return res.status(500).json({
        message: "Failed to create order.",
        error: orderError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const linkGuestOrdersController = async (req, res) => {
  const { user, email } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      await OrderModel.updateMany({ email }, { user });
      res
        .status(200)
        .json({ message: "All your orders are linked successfully!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error linking guest orders", error });
  }
};

// Get all orders (Admin use)
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await OrderModel.find().populate(
      "user",
      "firstName lastName email"
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await OrderModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({ orders, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const orders = await OrderModel.find({ isDelivered: { $ne: "Delivered" } }) // Use $ne (not equal) operator to exclude 'Delivered' orders
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts = await OrderModel.countDocuments({
      isDelivered: { $ne: "Delivered" },
    }); // Count documents excluding 'Delivered' orders
    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({ orders, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeliveredOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const orders = await OrderModel.find({ isDelivered: "Delivered" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await OrderModel.countDocuments({
      isDelivered: "Delivered",
    });
    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({ orders, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an order by ID
const getOrderByIdController = async (req, res) => {
  try {
    // const order = await OrderModel.findById(req.params.id).populate(
    //   "user",
    //   "firstName lastName email"
    // );
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order to paid
// export const updateOrderToPaidController = async (req, res) => {
//   try {
//     const order = await OrderModel.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.isPaid = true;
//     order.paidAt = new Date();
//     order.paymentResult = {
//       id: req.body.id,
//       status: req.body.status,
//       update_time: req.body.update_time,
//       email_address: req.body.email_address,
//     };

//     const updatedOrder = await order.save();
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Update order to delivered
const updateOrderStatusController = async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isDelivered = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    } else {
      order.deliveredAt = null;
    }

    // Save the updated order
    await order.save();
    res.status(200).json({ message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Get orders for a specific user
const getOrdersByUserController = async (req, res) => {
  const userId = req.user.id;
  if (userId) {
    try {
      const orders = await OrderModel.find({ user: userId }).sort({
        createdAt: -1,
      }); // filter by user ID
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error getting orders" });
    }
  } else {
    return res.status(400).json({ message: "User ID is missing or invalid" });
  }
};

const getOrdersByGuestController = async (req, res) => {
  const { guest } = req.query;
  if (!guest) {
    return res.status(400).json({ message: "Guest   required" });
  }
  try {
    const orders = await OrderModel.find({ guestEmail: guest }).sort({
      createdAt: -1,
    });
    if (!orders.length) {
      return res.status(404).json({ message: "No Previous orders" });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const getOrderByUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderByGuestController = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createOrderController,
  linkGuestOrdersController,
  getAllOrdersController,
  getOrdersByPage,
  getPendingOrders,
  getDeliveredOrders,
  getOrderByIdController,
  updateOrderStatusController,
  getOrdersByUserController,
  getOrdersByGuestController,
  getOrderByUserController,
  getOrderByGuestController,
};
