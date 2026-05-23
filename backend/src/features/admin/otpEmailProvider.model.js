import mongoose from "mongoose";

const otpEmailProviderSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
      trim: true,
    },
    providerType: {
      type: String,
      required: true,
      enum: [
        "smtp",
        "gmail_smtp",
        "sendgrid",
        "resend",
        "mailgun",
        "aws_ses",
        "custom_smtp",
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    host: {
      type: String,
      default: "",
      trim: true,
    },
    port: {
      type: Number,
      default: 587,
    },
    username: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      default: "",
      select: false,
    },
    encryption: {
      type: String,
      enum: ["none", "ssl", "tls"],
      default: "tls",
    },
    apiKey: {
      type: String,
      default: "",
      select: false,
    },
    senderEmail: {
      type: String,
      default: "",
      trim: true,
    },
    fromEmail: {
      type: String,
      default: "",
      trim: true,
    },
    domain: {
      type: String,
      default: "",
      trim: true,
    },
    accessKey: {
      type: String,
      default: "",
      select: false,
    },
    secretKey: {
      type: String,
      default: "",
      select: false,
    },
    region: {
      type: String,
      default: "",
      trim: true,
    },
    customHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customPayloadTemplate: {
      type: String,
      default: "",
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const OtpEmailProvider = mongoose.model(
  "OtpEmailProvider",
  otpEmailProviderSchema,
);

export default OtpEmailProvider;
