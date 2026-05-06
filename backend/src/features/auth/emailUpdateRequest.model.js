import mongoose from "mongoose";

const emailUpdateRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    newEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3, // Maximum 3 attempts
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Index for automatic expiry
emailUpdateRequestSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index to prevent duplicate requests for same user/email
emailUpdateRequestSchema.index(
  { userId: 1, newEmail: 1 },
  { unique: true, sparse: true },
);

const EmailUpdateRequest = mongoose.model(
  "EmailUpdateRequest",
  emailUpdateRequestSchema,
);

export default EmailUpdateRequest;
