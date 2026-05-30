import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "email",
        "number",
        "select",
        "checkbox",
        "file",
        "date",
      ],
      default: "text",
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    externalLink: {
      type: String,
      default: null,
      trim: true,
    },
    fields: {
      type: [formFieldSchema],
      default: [],
    },
    roleVisibility: {
      type: [String],
      enum: ["admin", "editor", "viewer", "student"],
      default: ["student"],
    },
    publicSlug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Form = mongoose.model("Form", formSchema);

export default Form;
