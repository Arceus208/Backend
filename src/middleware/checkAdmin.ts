import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { User } from "../models/user";
import { HttpError } from "../models/http-error";
import { Role } from "../models/role";

export const checkAdmin: RequestHandler = async (req) => {
  if (req.method === "OPTIONS") {
    return;
  }

  const authorization = req.headers["authorization"];

  if (!authorization) {
    throw new HttpError("not authenticated", 401);
  }

  try {
    const token = authorization.split(" ")[1];

    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
    if (!payload) {
      throw new HttpError("not authenticated", 401);
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new HttpError("not authenticated", 401);
    }

    const roleId = user.role;

    const roleEntity = await Role.findById(roleId);

    if (!roleEntity) {
      throw new HttpError("not authenticated", 401);
    }

    if (roleEntity.role !== "admin") {
      throw new HttpError("not authenticated", 401);
    }

    req.userId = payload.userId;
  } catch (err) {
    throw new HttpError("not authenticated", 401);
  }
};
