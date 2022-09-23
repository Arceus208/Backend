import { Response } from "express";

export const setRefreshToken = (res: Response, token: string) => {
  /* res.setHeader("Set-Cookie", `jid=${token}; Secure; HttpOnly; SameSite=None;`); */
  res.cookie("jid", token, {
    /* domain: "http://localhost:3000", */
    httpOnly: true,
    /* path: "/refresh_token", */
    sameSite: "none",
    secure: true,
  });
};
