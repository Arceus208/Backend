import express, { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import { HttpError } from "./models/http-error";
import productRoutes from "./routes/products";
import userRoutes from "./routes/users";
import orderRoutes from "./routes/orders";
import eventRoutes from "./routes/event";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getNewAccessToken } from "./middleware/getNewAccesToken";
import { createAdmin } from "./utils/createAdmin";
/* import { checkIOAuth } from "./middleware/checkIOAuth"; */
import { checkAdmin } from "./middleware/checkAdmin";
import { verify } from "jsonwebtoken";

dotenv.config();

const app = express();

const port = process.env.PORT;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;

app.set("trust proxy", process.env.NODE_ENV !== "production");
app.use(
  cors({
    origin: [`${process.env.FRONT_END_HOST}`, `${process.env.FRONT_END_ADMIN}`],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/order", orderRoutes);
app.use("/events", eventRoutes);

app.get("/refresh_token", getNewAccessToken);

/* createAdmin(); */

app.use(() => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500);
  res.json({ message: err.message || err });
});

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@cluster0.ohts1.mongodb.net/ecommerce?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port, () => {
      console.log("connect to server");
    });
  })
  .catch((err) => {
    console.log(err);
  });
