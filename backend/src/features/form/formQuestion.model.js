import mongoose from "mongoose";

const formQuestionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "shortAnswer",
        "paragraph",
        "email",
        "phone",
        "number",
        "date",
        "dropdown",
        "radio",
        "checkbox",
        "fileUpload",
        "imageUpload",
        "rating",
        "address",
        "link",
        "password",
        "sectionHeading",
      ],
      default: "shortAnswer",
    },
    placeholder: {
      type: String,
      default: "",
      trim: true,
    },
    helpText: {
      type: String,
      default: "",
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    validationEnabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
    validation: {
      minValue: {
        type: Number,
        default: null,
      },
      maxValue: {
        type: Number,
        default: null,
      },
      minDigits: {
        type: Number,
        default: null,
      },
      maxDigits: {
        type: Number,
        default: null,
      },
      errorMessage: {
        type: String,
        default: "",
        trim: true,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

formQuestionSchema.index({ formId: 1, order: 1 });

const FormQuestion = mongoose.model("FormQuestion", formQuestionSchema);

export default FormQuestion;
