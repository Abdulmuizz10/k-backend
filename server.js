import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//routes
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import utilityRoutes from "./routes/utilityRoutes.js";

dotenv.config();

const development = process.env.NODE_ENV === "development";

const corsOptions = {
  origin: development
    ? "http://localhost:5173"
    : process.env.FRONTEND_URL ||
      "https://keesdeen-abdulmuizz10s-projects.vercel.app",
  credentials: true,
};

// express initialization
const app = express();

//middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

//routes declarations
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/subscribers", subscriberRoutes);
app.use("/utility", utilityRoutes);

// app.use("/create-payment", paymentRoutes);

//database initialization
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.MONGO_DB_URL;
// const DATABASE_URL = process.env.LOCAL_URL;
mongoose
  .connect(DATABASE_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server connected to port: ${PORT}`))
  )
  .catch((error) =>
    console.log(`${error}Server is not connected to port: ${PORT}`)
  );
