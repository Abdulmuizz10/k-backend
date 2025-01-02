import express from "express";
import {
  signUp,
  signIn,
  googleSignIn,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/google-sign-in", googleSignIn);
router.post("/logout", logout);
router.post("/forget-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
