const mongoose = require("mongoose");

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
        "time",
        "dropdown",
        "radio",
        "checkbox",
        "fileUpload",
        "imageUpload",
        "link",
        "password",
        "rating",
        "address",
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
    sectionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    sectionTitle: {
      type: String,
      default: "",
      trim: true,
    },
    sectionDescription: {
      type: String,
      default: "",
      trim: true,
    },
    sectionOrder: {
      type: Number,
      default: 0,
    },
    sectionIsActive: {
      type: Boolean,
      default: true,
    },
    options: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    conditionalLogicVersion: {
      type: Number,
      default: 1,
    },
    maxConditionalDepth: {
      type: Number,
      default: 1,
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
formQuestionSchema.index({ formId: 1, sectionId: 1, order: 1 });

const FormQuestion = mongoose.model("FormQuestion", formQuestionSchema);

module.exports = FormQuestion;
