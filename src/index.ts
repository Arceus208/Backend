import express, { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import { HttpError } from "./models/http-error";
import productRoutes from "./routes/products";
import userRoutes from "./routes/users";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getNewAccessToken } from "./middleware/getNewAccesToken";

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

app.get("/refresh_token", getNewAccessToken);

app.use(() => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500);
  res.json({ message: err.message || err });
});

/* interface UserInterface {
  userId: string;
  socketId: string;
  role: string;
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [`${process.env.FRONT_END_HOST}`, `${process.env.FRONT_END_ADMIN}`],
    methods: ["GET", "POST"],
  },
});

let onlineUsers: UserInterface[] = [];

const addUser = (userId: string, socketId: string, role: string) => {
  const user = onlineUsers.find((user: any) => user.userId === userId);
  if (!user) {
    onlineUsers.push({ userId, socketId, role });
  }
};

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("login", (data) => {
    console.log(data);
    addUser(data.userId, socket.id, data.role);
    const admin = onlineUsers.find((user) => user.role === "admin");
    if (admin) {
      console.log(onlineUsers);
      io.to(admin?.socketId).emit("newUserLogin", onlineUsers);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    const admin = onlineUsers.find((user) => user.role === "admin");
    if (admin) {
      io.to(admin?.socketId).emit("newUserLogin", onlineUsers);
    }
    console.log("user leave");
  });
});
 */
mongoose
  .connect(
    `mongodb+srv://${username}:${password}@cluster0.ohts1.mongodb.net/ecommerce?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running !");
    });
  })
  .catch((err) => {
    console.log(err);
  });
