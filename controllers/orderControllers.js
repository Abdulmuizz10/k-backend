import OrderModel from "../models/orderModel.js";
import { Client, Environment } from "square";
import crypto from "crypto";

const { paymentsApi } = new Client({
  accessToken:
    "EAAAlywGhqE8hPyat5g4LIzFR_EjHl5_g0tuPABWLKCT_m3BOdq3ElOnG_O3_BFv",
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

// Helper function to convert BigInt values to strings in an object
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

// Create orders
const createOrderController = async (req, res) => {
  try {
    const { sourceId, totalPrice, currency, orderedItems, email } = req.body;

    // Basic field validation
    if (!sourceId || !totalPrice || !currency || !orderedItems || !email) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const { result } = await paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        currency: currency || "GBP",
        amount: Math.floor(totalPrice * 100), // Use correct amount calculation
      },
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
    });

    if (result) {
      try {
        const order = new OrderModel(req.body);
        const savedOrder = await order.save();

        // Convert BigInt values in the result object to strings
        const safeResult = convertBigIntToString(result);

        res
          .status(201)
          .json({ ...savedOrder.toObject(), paymentResult: safeResult });
      } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(500).json({ message: "Payment result is invalid." });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: error.message });
  }
};

const linkGuestOrdersController = async (req, res) => {
  const { user, email } = req.body;
  try {
    if (!user || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    await OrderModel.updateMany({ email }, { user });
    res
      .status(200)
      .json({ message: "All your orders are linked successfully!" });
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

// Get an order by ID
const getOrderByIdController = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "firstName lastName email"
    );
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
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for a specific user
const getOrdersByUserController = async (req, res) => {
  const userId = req.user.id;
  if (userId) {
    try {
      const orders = await OrderModel.find({ user: userId }); // filter by user ID
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
    const orders = await OrderModel.find({ email: guest });
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
  getOrderByIdController,
  updateOrderToDeliveredController,
  getOrdersByUserController,
  getOrdersByGuestController,
};
