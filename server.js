import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

//routes
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

// express initialization
const app = express();

//middlewares
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

//routes declarations
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

//database initialization
const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.LOCAL_URL;
mongoose
  .connect(DATABASE_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server connected to port: ${port}`))
  )
  .catch((error) =>
    console.log(`${error}Server is not connected to port: ${port}`)
  );
