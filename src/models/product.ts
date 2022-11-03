import mongoose, { Schema, model } from "mongoose";

interface IProduct {
  name: string;
  price: number;
  discount: number;
  curPrice: Number;
  description: string;
  mainImg: { photoId: string; path: string };
  images: { photoId: string; path: string }[];
  category: string;
  subCategory: string[];
  quantity: number;
  unitSold?: number;
  createAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  curPrice: {
    type: Number,
  },
  description: { type: String, required: true },
  mainImg: { type: { photoId: String, path: String } },
  images: { type: [{ photoId: String, path: String }] },
  category: {
    type: String,
    required: true,
    enum: ["card", "cards", "accessory"],
  },
  subCategory: { type: [String], required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitSold: { type: Number, default: 0 },
  createAt: { type: Date, required: true, default: Date.now },
});

productSchema.pre("save", function (next) {
  this.curPrice = this.price - (this.discount * this.price) / 100;
  next();
});

export const Product = model<IProduct>("Product", productSchema);
