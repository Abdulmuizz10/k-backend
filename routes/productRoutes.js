import express from "express";
import {
  createProductController,
  getAllProductsController,
  getProductsByPage,
  getProductByIdController,
  getCollections,
  searchProductsWithSuggestions,
  getProductsSearchResults,
  updateProductController,
  deleteProductController,
  addReviewController,
  getBestSellerProducts,
  getNewArrivalProducts,
  getActiveWearProducts,
  getFitnessAccessoriesProducts,
  updateProductToBestSeller,
  updateProductToNewArrival,
} from "../controllers/productControllers.js";

import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

router.post("/", verifyUser, authorizeAdmin, createProductController);
router.get("/", getAllProductsController);
router.get("/collections", getCollections);
router.get("/suggestions", searchProductsWithSuggestions);
router.get("/search-results", getProductsSearchResults);
router.get("/best-sellers", getBestSellerProducts);
router.get("/new-arrivals", getNewArrivalProducts);
router.get("/active-wears", getActiveWearProducts);
router.get("/fitness-accessories", getFitnessAccessoriesProducts);
router.get("/page/products", verifyUser, authorizeAdmin, getProductsByPage);
router.get("/:id", getProductByIdController);
router.patch(
  "/update/:id/best-seller",
  verifyUser,
  authorizeAdmin,
  updateProductToBestSeller
);
router.patch(
  "/update/:id/new-arrival",
  verifyUser,
  authorizeAdmin,
  updateProductToNewArrival
);
router.put("/:id", verifyUser, authorizeAdmin, updateProductController);
router.delete("/:id", verifyUser, authorizeAdmin, deleteProductController);
router.post("/:id/reviews", addReviewController);

export default router;
