import OrderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsersByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts = await UserModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({ users, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const orders = await OrderModel.find({ user: id });
    res.status(200).json({ user, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const newUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    let { isAdmin } = req.body;

    if (isAdmin === "true") isAdmin = true;
    else if (isAdmin === "false") isAdmin = false;
    else {
      return res
        .status(400)
        .json({ message: "isAdmin must be 'true' or 'false'" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.status(200).json({
      message: `User updated to ${isAdmin ? "Admin" : "Regular user"}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted" });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      squareCustomerId: user.squareCustomerId,
      savedCards: user.savedCards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCurrentUserProfile = async (req, res) => {
  const userId = req.user.id;
  const updatedProfile = req.body;

  try {
    if (updatedProfile.password) {
      updatedProfile.password = await bcrypt.hash(updatedProfile.password, 12);
    }

    const user = await UserModel.findByIdAndUpdate(userId, updatedProfile, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      squareCustomerId: user.squareCustomerId,
      savedCards: user.savedCards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  getUsersByPage,
  findUser,
  updateUser,
  updateToAdmin,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
