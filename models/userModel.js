import mongoose from "mongoose";
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  // googleId: { type: String, unique: true, sparse: true },
  password: {
    type: String,
    // required: function () {
    //   return !this.googleId;
    // },
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;
