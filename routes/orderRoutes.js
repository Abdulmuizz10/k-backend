import express from "express";
import {
  createOrderController,
  linkGuestOrdersController,
  getAllOrdersController,
  getOrdersByPage,
  getOrderByIdController,
  // updateOrderToPaidController,
  updateOrderToDeliveredController,
  getOrdersByUserController,
  getOrdersByGuestController,
} from "../controllers/orderControllers.js";

import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

// Create a new order
router.post("/", createOrderController);

router.post("/linkguest/orders", linkGuestOrdersController);

// Get all orders (Admin use)
router.get("/", verifyUser, authorizeAdmin, getAllOrdersController);

// Get orders by page
router.get("/page/orders", verifyUser, authorizeAdmin, getOrdersByPage);

// Get an order by ID
router.get("/:id", verifyUser, authorizeAdmin, getOrderByIdController);

// Update order to delivered
router.patch(
  "/:id/deliver",
  verifyUser,
  authorizeAdmin,
  updateOrderToDeliveredController
);

// Get orders for a specific user
router.get("/profile/orders", verifyUser, getOrdersByUserController);
router.get("/guest/orders", getOrdersByGuestController);

export default router;
