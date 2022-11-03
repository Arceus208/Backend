import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/user";
import bcrypt from "bcryptjs";
import { Role } from "../models/role";

export const createAdmin = async () => {
  try {
    const password = "admin";
    const hashedPassword = await bcrypt.hash(password, 12);

    const role = await Role.findOne({ role: "admin" });

    const newUser: HydratedDocument<IUser> = new User({
      name: "manh le",
      email: "admin@admin.com",
      password: hashedPassword,
      tokenVersion: Math.random(),
      role: role?._id,
    });

    await newUser.save();
  } catch (err) {
    console.log(err);
  }
};
