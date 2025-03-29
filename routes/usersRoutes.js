import express from "express";
import {
  getUsers,
  getUsersByPage,
  findUser,
  updateUser,
  updateToAdmin,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../controllers/usersControllers.js";
import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

// ------- Static routes --------
router.get("/profile", verifyUser, getCurrentUserProfile);
router.patch("/update_profile", verifyUser, updateCurrentUserProfile);
// ------- Data fetching routes -------
router.get("/page/users", verifyUser, authorizeAdmin, getUsersByPage);
router.get("/", verifyUser, authorizeAdmin, getUsers);
// ------- Admin-specific actions -------
router.put(
  "/update-to-admin/:userId",
  verifyUser,
  authorizeAdmin,
  updateToAdmin
);
// ------- Specific find route --------
router.get("/find/:id", verifyUser, authorizeAdmin, findUser);
// ------- Generic ID-based routes (ALWAYS LAST) --------
router.put("/:id", verifyUser, authorizeAdmin, updateUser);
router.delete("/:id", verifyUser, authorizeAdmin, deleteUser);

export default router;
