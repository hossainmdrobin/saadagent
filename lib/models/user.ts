import "server-only";

import mongoose, { Schema } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  failedLoginCount: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

export type UserModelType = Model<UserDocument>;
export type User = HydratedDocument<UserDocument>;

export const UserModel =
  (mongoose.models.User as UserModelType | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
