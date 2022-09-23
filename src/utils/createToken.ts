import { IUser } from "../models/User";
import { sign } from "jsonwebtoken";

export const createAccessToken = (user: IUser) => {
  return sign(
    { userId: user._id.toString() },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "10m",
    }
  );
};

export const createRefreshToken = (user: IUser) => {
  return sign(
    { userId: user._id.toString(), tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};
