import mongoose from "mongoose";

const formVerificationSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormQuestion",
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destinationType: {
      type: String,
      enum: ["email", "phone"],
      required: true,
      index: true,
    },
    challengeType: {
      type: String,
      enum: ["email", "phone"],
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      default: "",
      trim: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    resendAvailableAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
    verificationTokenJti: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
);

formVerificationSchema.index(
  { formId: 1, questionId: 1, destination: 1, verifiedAt: -1 },
);

const FormVerification = mongoose.model(
  "FormVerification",
  formVerificationSchema,
);

export default FormVerification;
