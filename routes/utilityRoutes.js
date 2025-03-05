import express from "express";

const router = express.Router();
import {
  createUtility,
  applyCoupon,
  getUtility,
  getDeliveryAndDiscount,
  updateUtility,
} from "../controllers/utilityControllers.js";
import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

router.post("/", verifyUser, authorizeAdmin, createUtility);
router.post("/apply-coupon", applyCoupon);
router.get("/", verifyUser, authorizeAdmin, getUtility);
router.get("/delivery-discount", getDeliveryAndDiscount);
router.put("/", verifyUser, authorizeAdmin, updateUtility);

export default router;
