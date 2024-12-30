import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const SubscriberModel = mongoose.model("SubscriberModel", subscriberSchema);

export default SubscriberModel;
