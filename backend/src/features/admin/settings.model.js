import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "Technosthan AgriTech",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    theme: {
      type: String,
      enum: ["default", "dark", "red-black"],
      default: "default",
    },
    defaultLanguage: {
      type: String,
      default: "en",
      trim: true,
    },
    aiSettings: {
      systemPrompt: {
        type: String,
        default: `You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.`,
        trim: true,
      },
      temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2,
      },
      maxTokens: {
        type: Number,
        default: 3000,
        min: 1,
        max: 8192,
      },
    },
    featureFlags: {
      aiChat: {
        type: Boolean,
        default: true,
      },
      quiz: {
        type: Boolean,
        default: true,
      },
      contentVisibility: {
        type: Boolean,
        default: true,
      },
      iotMonitoring: {
        type: Boolean,
        default: true,
      },
    },
    dashboardSettings: {
      visibleCards: {
        type: [String],
        default: ["stats", "users", "content", "quiz", "activity"],
      },
      cardOrder: {
        type: [String],
        default: ["stats", "users", "content", "quiz", "activity"],
      },
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
