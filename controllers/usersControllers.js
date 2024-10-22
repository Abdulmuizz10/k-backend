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

const findUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const existingUser = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(id, existingUser, {
      new: true,
    });
    res.status(200).json({ user });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
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
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
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
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  findUser,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
