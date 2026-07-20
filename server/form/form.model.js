const mongoose = require("mongoose");

const typographyStyleSchema = new mongoose.Schema(
  {
    fontFamily: { type: String, default: "", trim: true },
    fontSize: { type: String, default: "", trim: true },
    fontWeight: { type: String, default: "", trim: true },
    color: { type: String, default: "", trim: true },
    backgroundColor: { type: String, default: "", trim: true },
    textAlign: { type: String, default: "left", trim: true },
    fontStyle: { type: String, default: "", trim: true },
    textDecoration: { type: String, default: "", trim: true },
    lineHeight: { type: String, default: "", trim: true },
    letterSpacing: { type: String, default: "", trim: true },
    margin: { type: String, default: "", trim: true },
    padding: { type: String, default: "", trim: true },
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
    titleStyle: {
      type: typographyStyleSchema,
      default: () => ({
        fontFamily: "Poppins",
        fontSize: "36px",
        fontWeight: "700",
        color: "#111827",
        textAlign: "left",
        fontStyle: "normal",
        textDecoration: "none",
      }),
    },
    descriptionStyle: {
      type: typographyStyleSchema,
      default: () => ({
        fontFamily: "",
        fontSize: "",
        fontWeight: "",
        color: "",
        backgroundColor: "",
        textAlign: "left",
        fontStyle: "",
        textDecoration: "",
        lineHeight: "",
        letterSpacing: "",
        margin: "",
        padding: "",
      }),
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
    bannerImage: {
      type: String,
      default: "",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    logoAsset: {
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
    emailTemplate: {
      preset: {
        type: String,
        default: "green-professional",
        trim: true,
      },
      headerTitle: {
        type: String,
        default: "",
        trim: true,
      },
      headerSubtitle: {
        type: String,
        default: "",
        trim: true,
      },
      successMessage: {
        type: String,
        default: "",
        trim: true,
      },
      footerText: {
        type: String,
        default: "",
        trim: true,
      },
      companyName: {
        type: String,
        default: "",
        trim: true,
      },
      websiteButtonText: {
        type: String,
        default: "",
        trim: true,
      },
      websiteButtonUrl: {
        type: String,
        default: "",
        trim: true,
      },
      footerButtons: {
        type: [
          {
            id: {
              type: String,
              default: "",
              trim: true,
            },
            text: {
              type: String,
              default: "",
              trim: true,
            },
            url: {
              type: String,
              default: "",
              trim: true,
            },
            order: {
              type: Number,
              default: 0,
            },
          },
        ],
        default: [],
      },
      headerBackgroundColor: {
        type: String,
        default: "#16a34a",
        trim: true,
      },
      bodyBackgroundColor: {
        type: String,
        default: "#f3f4f6",
        trim: true,
      },
      cardBackgroundColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },
      accentColor: {
        type: String,
        default: "#16a34a",
        trim: true,
      },
      textColor: {
        type: String,
        default: "#0f172a",
        trim: true,
      },
      buttonColor: {
        type: String,
        default: "#16a34a",
        trim: true,
      },
      borderRadius: {
        type: Number,
        default: 24,
      },
      logoUrl: {
        type: String,
        default: "",
        trim: true,
      },
      bannerUrl: {
        type: String,
        default: "",
        trim: true,
      },
      logoAsset: {
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
      bannerImageUrl: {
        type: String,
        default: "",
        trim: true,
      },
      bannerImageAsset: {
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
    },
    notificationSettings: {
      sendEmailNotification: {
        type: Boolean,
        default: true,
      },
      sendDashboardNotification: {
        type: Boolean,
        default: false,
      },
      sendTelegramNotification: {
        type: Boolean,
        default: false,
      },
      telegramBotToken: {
        type: String,
        default: "",
        trim: true,
      },
      telegramChatId: {
        type: String,
        default: "",
        trim: true,
      },
      sendWhatsAppNotification: {
        type: Boolean,
        default: false,
      },
      whatsappAccessToken: {
        type: String,
        default: "",
        trim: true,
      },
      whatsappPhoneNumberId: {
        type: String,
        default: "",
        trim: true,
      },
      whatsappVerifyToken: {
        type: String,
        default: "",
        trim: true,
      },
      whatsappBusinessNumber: {
        type: String,
        default: "",
        trim: true,
      },
    },
    bannerImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    bannerImageAsset: {
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

module.exports = Form;
