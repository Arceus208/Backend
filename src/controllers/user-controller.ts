import { RequestHandler } from "express";

import { HttpError } from "../models/http-error";
import { HydratedDocument } from "mongoose";
import { User, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import { verify } from "jsonwebtoken";
import { setRefreshToken } from "../utils/setRefreshToken";
import { createAccessToken, createRefreshToken } from "../utils/createToken";
import { Token } from "../models/token";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import { Role } from "../models/role";

//register
export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return next(new HttpError("Email is already used!", 422));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const role = await Role.findOne({ role: "customer" });

    const newUser: HydratedDocument<IUser> = new User({
      name,
      email,
      password: hashedPassword,
      tokenVersion: Math.random(),
      role: role?._id,
    });

    await newUser.save();

    res.status(201).json({ user: newUser });
  } catch (err) {
    next(new HttpError("An error occured", 500));
  }
};

//login
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("Password or email is wrong!", 422));
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return next(new HttpError("Password or email is wrong!", 422));
    }

    setRefreshToken(res, createRefreshToken(user));

    const token = createAccessToken(user);

    res.status(201).json({ user: user._id.toString(), accessToken: token });
  } catch (err) {
    next(new HttpError("An error occured", 500));
  }
};

export const logout: RequestHandler = async (req, res) => {
  const token = req.cookies.jid;

  if (!token) {
    setRefreshToken(res, "");
    return res.json({ message: "logout" });
  }

  let payload: any;

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (err) {
    setRefreshToken(res, "");
    return res.json({ message: "logout" });
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    setRefreshToken(res, "");
    return res.json({ message: "logout" });
  }

  user.tokenVersion = Math.random();

  setRefreshToken(res, "");

  return res.status(201).json({ message: "logout" });
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "Password reset link was sent to your email account",
      });
    }

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await new Token({
        userId: user._id,
        token: uuidv4(),
      }).save();
    } else {
      await token.delete();
      token = token = await new Token({
        userId: user._id,
        token: uuidv4(),
      }).save();
    }

    const link = `${process.env.FRONT_END_HOST}/password-reset/${user._id}/${token.token}`;

    await sendEmail(user.email, "Password Reset", link);

    res.json({
      message: "Password reset link was sent to your email account",
    });
  } catch (err) {
    return next(new HttpError("An error occured", 500));
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.params.userId;
    const tokenContent = req.params.token;

    const user = await User.findById(userId);

    if (!user) {
      return res.json("There is no such user");
    }

    const token = await Token.findOne({
      userId: user._id,
      token: tokenContent,
    });

    if (!token) {
      return res.json("invalid link or expired token");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    await user.save();
    await token.delete();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return next(new HttpError("An error occured", 500));
  }
};
