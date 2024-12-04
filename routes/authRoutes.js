import express from "express";
import {
  signUp,
  signIn,
  googleSignIn,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/google-sign-in", googleSignIn);
router.post("/forget-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
