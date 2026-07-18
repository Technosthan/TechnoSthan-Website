const mongoose = require("mongoose");

const formResponseAnswerSchema = new mongoose.Schema(
  {
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
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    fileAsset: {
      url: {
        type: String,
        default: "",
      },
      secureUrl: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
      resourceType: {
        type: String,
        default: "",
      },
      format: {
        type: String,
        default: "",
      },
      originalName: {
        type: String,
        default: "",
      },
      mimeType: {
        type: String,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
      bytes: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
      version: {
        type: Number,
        default: null,
      },
      folder: {
        type: String,
        default: "",
      },
    },
    fieldId: {
      type: String,
      default: "",
      index: true,
    },
    fieldLabel: {
      type: String,
      default: "",
      trim: true,
    },
    fieldType: {
      type: String,
      default: "",
      trim: true,
    },
    parentQuestionId: {
      type: String,
      default: "",
      index: true,
    },
    parentOptionId: {
      type: String,
      default: "",
      index: true,
    },
    parentOptionLabel: {
      type: String,
      default: "",
      trim: true,
    },
    conditionalPath: {
      type: String,
      default: "",
      index: true,
    },
    conditionalDepth: {
      type: Number,
      default: 0,
    },
    conditionalOrder: {
      type: Number,
      default: 0,
    },
    conditionalMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    secretCiphertext: {
      type: String,
      default: "",
    },
    secretIv: {
      type: String,
      default: "",
    },
    secretAuthTag: {
      type: String,
      default: "",
    },
    secretAlgorithm: {
      type: String,
      default: "aes-256-gcm",
    },
  },
  { timestamps: true },
);

const FormResponseAnswer = mongoose.model(
  "FormResponseAnswer",
  formResponseAnswerSchema,
);

module.exports = FormResponseAnswer;
