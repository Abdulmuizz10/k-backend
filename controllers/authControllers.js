import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { sendResetEmailLink, sendWelcomeEmail } from "../lib/utils.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Existing signUp and signIn functions...

const signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(500).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      firstName,
      lastName,
      email,
      authMethod: "password",
      password: hashedPassword,
    });

    // Send welcome email
    await sendWelcomeEmail(email, firstName, "signup");

    const token = jwt.sign(
      { isAdmin: newUser.isAdmin, id: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      squareCustomerId: newUser.squareCustomerId,
      savedCards: newUser.savedCards,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: `${error}: Something went wrong` });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email }).select("+password");

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password or Email" });
    }

    // Send welcome email
    await sendWelcomeEmail(email, existingUser.firstName, "signin");

    const token = jwt.sign(
      { isAdmin: existingUser.isAdmin, id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin,
      squareCustomerId: existingUser.squareCustomerId,
      savedCards: existingUser.savedCards,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `${error.message || error}: Something went wrong` });
  }
};

const googleSignIn = async (req, res) => {
  const { googleToken } = req.body;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    const {
      email,
      given_name: firstName,
      family_name: lastName,
    } = response.data;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        firstName,
        lastName,
        email,
        authMethod: "google",
      });

      // Send welcome email
      await sendWelcomeEmail(email, firstName, "signup");
    } else {
      // Send welcome email for sign in
      await sendWelcomeEmail(email, user.firstName, "signin");
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      squareCustomerId: user.squareCustomerId,
      savedCards: user.savedCards,
      token,
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return res.status(500).json({ message: "Google sign-in failed" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset_password/${resetToken}`;
    const message = `Click here to reset your password: ${resetUrl}`;

    await sendResetEmailLink({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Invalid or expired token" });
  }
};

export { signUp, signIn, googleSignIn, forgotPassword, resetPassword };
