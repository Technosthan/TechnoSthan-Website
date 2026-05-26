import mongoose from "mongoose";

const otpPhoneProviderSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
      trim: true,
    },
    providerType: {
      type: String,
      required: true,
      enum: ["twilio", "msg91", "firebase", "whatsapp", "vonage", "custom_api"],
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
    twilioAccountSid: {
      type: String,
      default: "",
      trim: true,
      select: false,
    },
    twilioAuthToken: {
      type: String,
      default: "",
      select: false,
    },
    twilioPhoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    msg91AuthKey: {
      type: String,
      default: "",
      select: false,
    },
    msg91TemplateId: {
      type: String,
      default: "",
      trim: true,
    },
    firebaseApiKey: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },
    firebaseRecaptchaToken: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },
    firebaseConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    whatsappAccessToken: {
      type: String,
      default: "",
      select: false,
    },
    whatsappPhoneNumberId: {
      type: String,
      default: "",
      trim: true,
    },
    whatsappVerifyToken: {
      type: String,
      default: "",
      select: false,
    },
    vonageApiKey: {
      type: String,
      default: "",
      select: false,
    },
    vonageApiSecret: {
      type: String,
      default: "",
      select: false,
    },
    vonageFromNumber: {
      type: String,
      default: "",
      trim: true,
    },
    customApiEndpoint: {
      type: String,
      default: "",
      trim: true,
    },
    customApiMethod: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH"],
      default: "POST",
    },
    customApiHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customApiPayloadTemplate: {
      type: String,
      default: "",
      trim: true,
    },
    customApiAuthKey: {
      type: String,
      default: "",
      select: false,
    },
    customApiAuthHeaderName: {
      type: String,
      default: "Authorization",
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

const OtpPhoneProvider = mongoose.model(
  "OtpPhoneProvider",
  otpPhoneProviderSchema,
);

export default OtpPhoneProvider;
