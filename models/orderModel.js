import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  addressLineOne: { type: String, required: true },
  addressLineTwo: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const billingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  street: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: function () {
        return !this.guestOrder;
      },
    },
    email: { type: String, required: true },
    sourceId: {
      type: String,
      required: function () {
        return this.paidAt !== null;
      },
    },
    currency: { type: String, required: true },
    coupon: { type: String, required: false },
    orderedItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductModel",
          required: true,
        },
        size: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    shippingAddress: { type: shippingSchema, required: true },
    billingAddress: {
      type: billingSchema,
      required: function () {
        return !this.billingSameAsShipping;
      },
    },
    billingSameAsShipping: { type: Boolean, default: true },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    guestOrder: { type: Boolean, required: true, default: false },
    guestEmail: {
      type: String,
      required: function () {
        return this.guestOrder;
      },
    },
    paidAt: { type: Date, required: false },
    isDelivered: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
      default: "Pending",
    },
    deliveredAt: { type: Date, required: false },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("OrderModel", orderSchema);

export default OrderModel;
