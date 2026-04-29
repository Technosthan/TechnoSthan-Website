import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: true,
      index: true,
    },
    contactType: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["sms", "whatsapp", "telegram", "instagram", "messenger", "email"],
      required: true,
    },
    purpose: {
      type: String,
      enum: ["register", "login", "verify-email", "verify-phone"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
      // index: { expires: 0 }, // TTL index - commented out for debugging
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pendingUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PendingUser",
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for rate limiting
otpSchema.index({ contact: 1, purpose: 1, createdAt: -1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
