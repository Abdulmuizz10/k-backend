import express from "express";
import { verifyUser, authorizeAdmin } from "../middleware/verify.js";
import {
  createSubscriber,
  getAllSubscribers,
  sendEmailToSubscribers,
} from "../controllers/subscriberControllers.js";

const router = express.Router();

router.post("/", createSubscriber);

router.post("/send-email", verifyUser, authorizeAdmin, sendEmailToSubscribers);

router.get("/all-subscribers", verifyUser, authorizeAdmin, getAllSubscribers);

export default router;
