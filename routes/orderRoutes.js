import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  // updateOrderToPaidController,
  updateOrderToDeliveredController,
  getOrdersByUserController,
} from "../controllers/orderControllers.js";

import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

// Create a new order
router.post("/", verifyUser, createOrderController);

// Get all orders (Admin use)
router.get("/", verifyUser, authorizeAdmin, getAllOrdersController);

// Get an order by ID
router.get("/:id", verifyUser, authorizeAdmin, getOrderByIdController);

// Update order to delivered
router.put(
  "/:id/deliver",
  verifyUser,
  authorizeAdmin,
  updateOrderToDeliveredController
);

// Get orders for a specific user
router.get("/orders", verifyUser, getOrdersByUserController);

export default router;
