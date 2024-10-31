import express from "express";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  addReviewController,
} from "../controllers/productControllers.js";

import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

router.post("/", verifyUser, authorizeAdmin, createProductController);
router.get("/", getAllProductsController);
router.get("/:id", getProductByIdController);
router.put("/:id", verifyUser, authorizeAdmin, updateProductController);
router.delete("/:id", verifyUser, authorizeAdmin, deleteProductController);
router.post("/:id/reviews", addReviewController);

export default router;
