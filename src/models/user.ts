import { Schema, model } from "mongoose";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;

  tokenVersion: number;
  role: Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  tokenVersion: { type: Number, required: true },
  role: { type: Schema.Types.ObjectId, required: true, ref: "Role" },
});

export const User = model<IUser>("User", userSchema);
