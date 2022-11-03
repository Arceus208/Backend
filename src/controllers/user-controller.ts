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
import { Order } from "../models/order";
import { checkAdmin } from "../middleware/checkAdmin";

//register
export const register: RequestHandler = async (req, res, next) => {
  const { email, password, name } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    return next(new HttpError("Email is already used!", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const role = await Role.findOne({ role: "customer" });
  try {
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
    console.log(err);
    return next(new HttpError("Some error occured", 500));
  }
};

//login
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("Password or email is wrong!", 400));
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return next(new HttpError("Password or email is wrong!", 400));
    }

    setRefreshToken(res, createRefreshToken(user));

    const token = createAccessToken(user);

    res.status(201).json({
      userId: user._id.toString(),
      userName: user.name,
      accessToken: token,
    });
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
      token = await new Token({
        userId: user._id,
        token: uuidv4(),
      }).save();
    }

    const link = `${process.env.FRONT_END_HOST}/password-reset/${user._id}/${token.token}`;

    await sendEmail(user.email, "Password Reset", link);

    res.status(201).json({
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
      return next(new HttpError("There is no such user", 400));
    }

    const token = await Token.findOne({
      userId: user._id,
      token: tokenContent,
    });

    if (!token) {
      return next(new HttpError("invalid link or expired token", 400));
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

export const changePassword: RequestHandler = async (req, res, next) => {
  const userId = req.userId;
  const { newPassword, oldPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("There is no such user", 400));
    }

    const valid = await bcrypt.compare(oldPassword, user.password);

    if (!valid) {
      return next(new HttpError("Old password is incorrect!", 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    res.status(201).json({ message: "Change password successfully" });
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }
};

export const changeProfile: RequestHandler = async (req, res, next) => {
  const { email, name } = req.body;
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("There is no such user", 400));
    }
    if (email !== user.email) {
      const user = await User.findOne({ email });
      if (user) {
        return next(new HttpError("Email is already used", 400));
      }
    }
    user.email = email;
    user.name = name;
    await user.save();
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }

  res.status(201).json({ message: "Edit succesfully" });
};

export const changeAddress: RequestHandler = async (req, res, next) => {
  const { city, street, country, postnumber } = req.body;
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("There is no such user", 400));
    }

    user.address = { city, street, country, postnumber };

    await user.save();

    res.status(201).json({ message: "Change address successfully" });
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("There is no such user", 400));
    }

    res.status(201).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }
};

export const getAdmin: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("There is no such user", 400));
    }

    res.status(201).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }
};

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  try {
    const { page, limit } = req.query;
    let pageLimit, currentPage;
    if (!page) {
      currentPage = 0;
    } else {
      currentPage = parseInt(page as string);
    }

    if (!limit) {
      pageLimit = 20;
    } else {
      pageLimit = parseInt(limit as string);
    }

    const roleId = await Role.find({ role: "customer" });

    const users = await User.find(
      { role: roleId },
      "name id email role orders createAt"
    )
      .populate("role")
      .limit(pageLimit)
      .skip(currentPage * pageLimit);

    res.status(201).json({
      users: users.map((user) => user.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Some error occured!", 500));
  }
};

export const getUserOrders: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;
    let pageLimit, currentPage;

    if (!page) {
      currentPage = 0;
    } else {
      currentPage = parseInt(page as string);
    }

    if (!limit) {
      pageLimit = 20;
    } else {
      pageLimit = parseInt(limit as string);
    }

    const user = await User.findById(userId)
      .populate({ path: "orders", options: { sort: [{ createAt: "desc" }] } })
      .limit(pageLimit)
      .skip(currentPage * pageLimit);

    if (!user) {
      return next(new HttpError("Cannot find user", 404));
    }

    res.status(201).json({
      orders: user.orders,
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};
