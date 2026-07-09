import mongoose from "mongoose";

const formResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

formResponseSchema.index(
  { formId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string", $ne: "" },
    },
  },
);

formResponseSchema.index(
  { formId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: "string", $ne: "" },
    },
  },
);

const FormResponse = mongoose.model("FormResponse", formResponseSchema);

export default FormResponse;
