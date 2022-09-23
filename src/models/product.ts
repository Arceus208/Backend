import mongoose, { Schema, model } from "mongoose";

interface IProduct {
  name: string;
  price: number;
  description: string;
  mainImg: { photoId: string; path: string };
  images: { photoId: string; path: string }[];
  category: string;
  subCategory: string[];
  quantity: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  mainImg: { type: { photoId: String, path: String } },
  images: { type: [{ photoId: String, path: String }] },
  category: {
    type: String,
    required: true,
  },
  subCategory: { type: [String], required: true },
  quantity: { type: Number, required: true, min: 0 },
});

export const Product = model<IProduct>("Product", productSchema);
