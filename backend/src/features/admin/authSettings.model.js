import mongoose from "mongoose";

const authSettingsSchema = new mongoose.Schema(
  {
    whatsapp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      accessToken: {
        type: String,
        default: "",
        select: false, // Hide from regular queries
      },
      phoneNumberId: {
        type: String,
        default: "",
      },
      verifyToken: {
        type: String,
        default: "",
        select: false,
      },
      templateName: {
        type: String,
        default: "otp_verification",
        trim: true,
      },
      businessAccountId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    telegram: {
      enabled: {
        type: Boolean,
        default: true,
      },
      botToken: {
        type: String,
        default: "",
        select: false,
      },
      botUsername: {
        type: String,
        default: "",
        trim: true,
      },
      webhookUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },
    emailOtp: {
      enabled: {
        type: Boolean,
        default: true,
      },
    },
    phoneOtp: {
      enabled: {
        type: Boolean,
        default: true,
      },
    },
    otpSecurity: {
      expiryMinutes: {
        type: Number,
        default: 5,
        min: 1,
        max: 60,
      },
      resendCooldown: {
        type: Number,
        default: 60,
        min: 30,
        max: 300,
      },
      maxAttempts: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },
      maxDailyRequests: {
        type: Number,
        default: 10,
        min: 1,
        max: 50,
      },
    },
  },
  { timestamps: true },
);

const AuthSettings = mongoose.model("AuthSettings", authSettingsSchema);

export default AuthSettings;
