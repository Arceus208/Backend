import { Schema, model } from "mongoose";
import { Types } from "mongoose";
import { IAddress } from "./user";

export interface IOrder {
  status: string;
  items: {
    id: Types.ObjectId;
    quantity: number;
    price: number;
    image: string;
    name: string;
  }[];
  totalPrice: number;
  customerId: Types.ObjectId;
  customerName: String;
  shippingAddress: IAddress;
  customerEmail: string;
  createAt: Date;
}

const orderSchema = new Schema<IOrder>({
  status: {
    type: String,
    required: true,
  },
  items: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
    },
  ],
  totalPrice: { type: Number, required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "User" },
  customerEmail: { type: String, required: true },
  shippingAddress: {
    city: { type: String, required: true },
    postnumber: { type: String, required: true },
    street: { type: String, required: true },
    country: { type: String, required: true },
  },
  createAt: { type: Date, required: true, default: Date.now },
});

export const Order = model<IOrder>("Order", orderSchema);
