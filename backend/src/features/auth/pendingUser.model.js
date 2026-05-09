import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.mobile;
      },
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    mobile: {
      type: String,
      required: function () {
        return !this.email;
      },
      unique: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpSent: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Index for expiry (auto delete after 1 hour)
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;
