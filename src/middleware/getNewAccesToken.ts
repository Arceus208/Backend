import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { User } from "../models/user";
import { createAccessToken, createRefreshToken } from "../utils/createToken";
import { setRefreshToken } from "../utils/setRefreshToken";

export const getNewAccessToken: RequestHandler = async (req, res) => {
  const token = req.cookies.jid;

  if (!token) {
    return res.json({ accessToken: "" });
  }

  let payload: any;

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (err) {
    return res.json({ accessToken: "" });
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    return res.json({ accessToken: "" });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.json({ accessToken: "" });
  }

  setRefreshToken(res, createRefreshToken(user));

  return res.json({ accessToken: createAccessToken(user) });
};
