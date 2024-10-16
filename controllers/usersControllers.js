import UserModel from "../models/userModel.js";

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
  const existingUser = UserModel.findById(req.user.id);
  if (existingUser) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        existingUser._id,
        existingUser,
        {
          new: true,
        }
      );
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(404).json({ message: "user not found" });
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
