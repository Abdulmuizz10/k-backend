import express from "express";
import {
  signUp,
  signIn,
  googleSignIn,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/google-sign-in", googleSignIn);

export default router;
