import mongoose from "mongoose";

const whatsappOtpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3, // Max 3 verification attempts
    },
    resendCount: {
      type: Number,
      default: 0,
      max: 3, // Max 3 resends per hour
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto delete after expiry
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
    purpose: {
      type: String,
      enum: ["login", "register", "verification"],
      default: "login",
    },
    lastResendAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for rate limiting (phone + purpose + time window)
whatsappOtpSchema.index(
  { phoneNumber: 1, purpose: 1, createdAt: -1 },
  { name: "rate_limit_index" },
);

const WhatsappOtp = mongoose.model("WhatsappOtp", whatsappOtpSchema);

export default WhatsappOtp;
