import express from "express";
import {
  createOrderController,
  linkGuestOrdersController,
  getAllOrdersController,
  getOrdersByPage,
  getPendingOrders,
  getDeliveredOrders,
  getOrderByIdController,
  // updateOrderToPaidController,
  updateOrderStatusController,
  getOrdersByUserController,
  getOrdersByGuestController,
  getOrderByUserController,
  getOrderByGuestController,
} from "../controllers/orderControllers.js";

import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

// Create a new order
router.post("/", createOrderController);
router.post("/link-guest/orders", linkGuestOrdersController);

router.get("/", verifyUser, authorizeAdmin, getAllOrdersController);
router.get("/page/orders", verifyUser, authorizeAdmin, getOrdersByPage);
router.get(
  "/page/pending-orders",
  verifyUser,
  authorizeAdmin,
  getPendingOrders
);
router.get(
  "/page/delivered-orders",
  verifyUser,
  authorizeAdmin,
  getDeliveredOrders
);
router.get("/:id", verifyUser, authorizeAdmin, getOrderByIdController);
router.patch(
  "/:id/deliver",
  verifyUser,
  authorizeAdmin,
  updateOrderStatusController
);

// Get orders for a specific user or guest
router.get("/profile/orders", verifyUser, getOrdersByUserController);
router.get("/guest/orders", getOrdersByGuestController);

// Get order for a specific user or guest
router.get("/profile/order/:id", verifyUser, getOrderByUserController);
router.get("/guest/order/:id", getOrderByGuestController);

export default router;
