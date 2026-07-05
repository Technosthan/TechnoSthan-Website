import mongoose from "mongoose";

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
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "live"],
      default: "draft",
    },
    successMessage: {
      type: String,
      default: "Thanks for your response.",
      trim: true,
    },
    notificationEmail: {
      type: String,
      default: "",
      trim: true,
    },
    confirmationEmailEnabled: {
      type: Boolean,
      default: false,
    },
    allowFileUpload: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    themeColor: {
      type: String,
      default: "#16a34a",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

formSchema.virtual("active").get(function active() {
  return this.status === "live";
});

formSchema.set("toJSON", { virtuals: true });
formSchema.set("toObject", { virtuals: true });

const Form = mongoose.model("Form", formSchema);

export default Form;
