import { Schema, model } from "mongoose";

export interface IRole {
  role: string;
}

const roleSchema = new Schema<IRole>({
  role: { type: String, required: true, enum: ["admin", "customer"] },
});

export const Role = model<IRole>("Role", roleSchema);
