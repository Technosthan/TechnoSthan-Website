import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["telegram", "whatsapp"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

loginOtpSchema.index({ identifier: 1, method: 1, createdAt: -1 });

const LoginOtp = mongoose.model("LoginOtp", loginOtpSchema);

export default LoginOtp;
