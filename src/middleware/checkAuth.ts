import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { HttpError } from "../models/http-error";

export const checkAuth: RequestHandler = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
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

    req.userId = payload.userId;
  } catch (err) {
    throw new HttpError("not authenticated", 401);
  }

  return next();
};
