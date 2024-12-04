import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true, // Prevent duplicate emails for registered users
      required: true,
      // match: [/.+@.+\..+/, "Please enter a valid email address"], // Basic email validation
    },
    password: {
      type: String,
      required: function () {
        return this.authMethod === "password"; // Required only for password-based users
      },
      select: false, // Exclude password from queries by default for security
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },

    authMethod: {
      type: String,
      enum: ["password", "google"], // Define possible authentication methods
      default: "password",
    },
    squareCustomerId: {
      type: String,
      default: null, // Set after creating the Square customer
    },
    savedCards: [
      {
        cardId: { type: String, required: false },
        cardBrand: { type: String, required: false },
        last4: { type: String, required: false },
        expMonth: { type: Number, required: false },
        expYear: { type: Number, required: false },
      },
    ],
    // orders: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "OrderModel", // Links user to their order records
    //     required: false,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserModel", userSchema);

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: function () {
//         return !this.isGuest; // Username is required only for registered users
//       },
//     },
//     email: {
//       type: String,
//       unique: true, // Prevent duplicate emails for registered users
//       required: true,
//       match: [/.+@.+\..+/, "Please enter a valid email address"], // Basic email validation
//     },
//     password: {
//       type: String,
//       required: function () {
//         return !this.isGuest; // Password is required only for registered users
//       },
//       select: false, // Exclude password from queries by default for security
//     },
//     isAdmin: {
//       type: Boolean,
//       default: false,
//       required: true,
//     },
//     isGuest: {
//       type: Boolean,
//       default: false, // Differentiates between guests and registered users
//     },
//     squareCustomerId: {
//       type: String,
//       default: null, // Set after creating the Square customer
//     },
//     savedCards: [
//       {
//         cardId: String,
//         cardBrand: String,
//         last4: String,
//         expMonth: Number,
//         expYear: Number,
//       },
//     ],
//     orders: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "OrderModel", // Links user to their order records
//       },
//     ],
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt fields
//   }
// );

// export default mongoose.model("UserModel", userSchema);
