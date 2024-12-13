import OrderModel from "../models/orderModel.js";
import { Client, Environment } from "square";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import { formatAmount } from "../lib/utils.js";

dotenv.config();

const { paymentsApi } = new Client({
  accessToken:
    "EAAAlywGhqE8hPyat5g4LIzFR_EjHl5_g0tuPABWLKCT_m3BOdq3ElOnG_O3_BFv",
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

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const createOrderController = async (req, res) => {
  try {
    const {
      sourceId,
      totalPrice,
      currency,
      orderedItems,
      firstName,
      lastName,
      email,
      country,
      cityAndRegion,
      zipCode,
    } = req.body;

    if (
      !sourceId ||
      !totalPrice ||
      !currency ||
      !orderedItems ||
      !firstName ||
      !lastName ||
      !email ||
      !country ||
      !cityAndRegion ||
      !zipCode
    ) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const { result } = await paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        currency: currency || "GBP",
        amount: Math.floor(totalPrice * 100),
      },
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
    });

    if (result) {
      try {
        const order = new OrderModel(req.body);
        const savedOrder = await order.save();

        const safeResult = convertBigIntToString(result);

        // Send confirmation email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Order Confirmation",
          html: `
            <h1>Order Confirmation</h1>
            <p>Dear ${firstName} ${lastName},</p>
            <p>Thank you for your order. Here are the details:</p>
            <ul>
              <li><strong>Order ID:</strong> ${savedOrder._id}</li>
              <li><strong>Total Price:</strong> ${formatAmount(
                totalPrice,
                currency
              )}</li>
              <li><strong>Ordered Items:</strong></li>
              <ul>
                ${orderedItems
                  .map(
                    (item) =>
                      `<li>${item.qty} x ${item.name} (${
                        item.size
                      }) - ${formatAmount(item.price, currency)}</li>`
                  )
                  .join("")}
              </ul>
            </ul>
            <p>We will notify you once your order has been shipped.</p>
          `,
        };

        await transporter.sendMail(mailOptions);

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
    res.status(400).json({ message: error.message });
  }
};

const linkGuestOrdersController = async (req, res) => {
  const { user, email } = req.body;
  try {
    const existingOrder = await userModel.findOne({ email: email });
    if (existingOrder) {
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

    const orders = await OrderModel.find({ isDelivered: false })
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

const getDeliveredOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const orders = await OrderModel.find({ isDelivered: true })
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
const updateOrderToDeliveredController = async (req, res) => {
  let { status } = req.body;

  // Convert the 'status' string to a boolean
  if (status === "true") {
    status = true;
  } else if (status === "false") {
    status = false;
  } else {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order delivery status
    order.isDelivered = status;
    order.deliveredAt = status ? new Date() : null;
    await order.save();

    // Respond with an appropriate message
    const message = status
      ? "Order status updated to delivered"
      : "Order status updated to not delivered";
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: "User ID is missing or invalid" });
  }
};

const getOrdersByGuestController = async (req, res) => {
  const { guest } = req.query;
  if (!guest) {
    return res.status(400).json({ message: "Guest email is required" });
  }
  try {
    const orders = await OrderModel.find({ email: guest }).sort({
      createdAt: -1,
    });
    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this email" });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
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
  updateOrderToDeliveredController,
  getOrdersByUserController,
  getOrdersByGuestController,
};
