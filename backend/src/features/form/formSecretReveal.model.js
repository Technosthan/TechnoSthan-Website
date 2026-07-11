import mongoose from "mongoose";

const formSecretRevealSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormResponse",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormQuestion",
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    revealedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

formSecretRevealSchema.index({ formId: 1, responseId: 1, questionId: 1, revealedAt: -1 });

const FormSecretReveal = mongoose.model(
  "FormSecretReveal",
  formSecretRevealSchema,
);

export default FormSecretReveal;
