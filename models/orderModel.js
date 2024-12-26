import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "UserModel",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    cityAndRegion: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    zipCode: { type: String, required: true },
    sourceId: { type: String, required: false },
    currency: { type: String, require: true },
    coupon: { type: String, required: false },
    orderedItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "ProductModel",
        },
        size: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    addressLineOne: { type: String, required: true },
    addressLineTwo: { type: String, required: false },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    guestOrder: { type: Boolean, default: false, required: true },
    guestEmail: { type: String, required: false },
    paidAt: {
      type: Date,
      required: true,
    },
    isDelivered: {
      type: String,
      required: false,
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
      default: "Pending",
    },

    deliveredAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

export default OrderModel;
