import { Response } from "express";

export const setRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    /* domain: "http://localhost:3000", */
    httpOnly: true,
    /* path: "/refresh_token", */
    sameSite: "none",
    secure: true,
  });
};
