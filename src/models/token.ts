import { Schema, model } from "mongoose";
import { Types } from "mongoose";

export interface IToken {
  userId: Types.ObjectId;
  token: string;
  createAt: Date;
}

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

export const Token = model<IToken>("Token", tokenSchema);
