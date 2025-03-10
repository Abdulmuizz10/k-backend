import OrderModel from "../models/orderModel.js";
import { Client, Environment } from "square";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import { sendOrderConfirmationEmail } from "../lib/utils.js";
dotenv.config();

const { paymentsApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

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

// const createOrderController = async (req, res) => {
//   try {
//     const { sourceId, totalPrice, currency, orderedItems } = req.body;
//     if (!sourceId || !totalPrice || !currency || !orderedItems) {
//       return res.status(400).json({ message: "Required fields are missing." });
//     }

//     const { result } = await paymentsApi.createPayment({
//       sourceId,
//       amountMoney: {
//         currency: currency,
//         amount: Math.floor(totalPrice * 100),
//       },
//       idempotencyKey: crypto.randomUUID(),
//       locationId: process.env.SQUARE_LOCATION_ID,
//     });

//     if (result) {
//       try {
//         const order = new OrderModel(req.body);
//         const savedOrder = await order.save();

//         const safeResult = convertBigIntToString(result);

//         // Send confirmation email via utility function
//         await sendOrderConfirmationEmail(
//           savedOrder.email,
//           savedOrder.shippingAddress.firstName,
//           savedOrder.shippingAddress.lastName,
//           savedOrder.totalPrice,
//           savedOrder.currency,
//           savedOrder.orderedItems,
//           savedOrder._id
//         );

//         res
//           .status(200)
//           .json({ ...savedOrder.toObject(), paymentResult: safeResult });
//       } catch (error) {
//         res.status(400).json({ message: error.message });
//       }
//     } else {
//       res.status(400).json({ message: "Payment result is invalid." });
//     }
//   } catch (error) {
//     res.status(400).json({ message: "Payment error, Please try again" });
//   }
// };

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

    const address = billingAddress || shippingAddress;

    if (!sourceId || !totalPrice || !currency || !orderedItems || !address) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const { zipCode, addressLineOne, country, state, city } = address;

    const { result } = await paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        currency,
        amount: Math.floor(totalPrice * 100),
      },
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
      billingAddress: {
        postalCode: zipCode, // Add postal code for AVS checks
        addressLine1: addressLineOne,
        locality: city,
        administrativeDistrictLevel1: state,
        country,
      },
      buyerEmailAddress: email,
    });

    if (result) {
      try {
        const order = new OrderModel(req.body);
        const savedOrder = await order.save();
        const safeResult = convertBigIntToString(result);
        await sendOrderConfirmationEmail(
          email,
          shippingAddress.firstName,
          shippingAddress.lastName,
          totalPrice,
          currency,
          orderedItems,
          savedOrder._id
        );
        res
          .status(200)
          .json({ ...savedOrder.toObject(), paymentResult: safeResult });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json({ message: "Payment result is invalid." });
    }
  } catch (error) {
    res.status(400).json({ message: "Payment error, Please try again" });
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
