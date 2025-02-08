import express from "express";
import {
  getUsers,
  getUsersByPage,
  findUser,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../controllers/usersControllers.js";
import { verifyUser, authorizeAdmin } from "../middleware/verify.js";

const router = express.Router();

router.get("/", verifyUser, authorizeAdmin, getUsers);
router.get("/page/users", verifyUser, authorizeAdmin, getUsersByPage);
router.put("/:id", verifyUser, authorizeAdmin, updateUser);
router.get("/find/:id", verifyUser, authorizeAdmin, findUser);
router.delete("/:id", verifyUser, authorizeAdmin, deleteUser);
router.get("/profile", verifyUser, getCurrentUserProfile);
router.patch("/update_profile", verifyUser, updateCurrentUserProfile);

export default router;
