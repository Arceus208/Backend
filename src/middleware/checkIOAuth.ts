/* import { Socket } from "socket.io";
import { verify } from "jsonwebtoken";
import { Role } from "../models/role";
import { User } from "../models/user";

declare module "socket.io" {
  interface Socket {
    userId: string;
    role: string;
  }
}

 const checkIOAuth = async (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token;
  const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;

  if (!payload) {
    const err = new Error("not authorized");
    err.message = "Please try again later";
    next(err);
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    const err = new Error("There is no user with that id");
    err.message = "Please try again later";
    return next(err);
  }

  const role = await Role.findById(user.role);

  if (!role) {
    return next(new Error("No such role"));
  }
  socket.role = role.role;

  socket.userId = payload.userId;

  next();
}; */
