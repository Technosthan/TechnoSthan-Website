const mongoose = require("mongoose");

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
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAvailableAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

formVerificationSchema.index(
  { formId: 1, questionId: 1, destination: 1, type: 1 },
  { unique: true },
);

formVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FormVerification = mongoose.model(
  "FormVerification",
  formVerificationSchema,
);

module.exports = FormVerification;
