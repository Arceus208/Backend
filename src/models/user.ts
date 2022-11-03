import { Schema, model } from "mongoose";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;

  tokenVersion: number;
  role: Types.ObjectId;
  address?: IAddress;
  createAt: Date;
  orders: Types.ObjectId[];
}

export interface IAddress {
  city: string;
  postnumber: string;
  street: string;
  country: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  tokenVersion: { type: Number, required: true },
  role: { type: Schema.Types.ObjectId, required: true, ref: "Role" },
  address: {
    type: {
      city: { type: String, required: true },
      postnumber: { type: String, required: true },
      street: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  createAt: { type: Date, required: true, default: Date.now },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
});

export const User = model<IUser>("User", userSchema);
