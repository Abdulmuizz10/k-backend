import mongoose from "mongoose";

const utilitySchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: false,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      required: false,
    },
    discount: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UtilityModel", utilitySchema);
