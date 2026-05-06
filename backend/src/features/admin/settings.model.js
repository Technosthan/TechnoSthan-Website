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

    aiSettings: {
      mode: {
        type: String,
        enum: ["single", "fallback"],
        default: "single",
      },
      providers: [
        {
          providerId: {
            type: String,
            required: true,
            unique: true,
          },
          providerType: {
            type: String,
            enum: ["gemini", "openai", "custom", "token-only"],
            required: true,
          },
          customName: {
            type: String,
            trim: true,
          },
          apiKey: {
            type: String,
            select: false,
          },
          modelName: {
            type: String,
            trim: true,
          },
          apiUrl: {
            type: String,
            trim: true,
          },
          configFile: {
            type: String, // JSON string of config
          },
          isActive: {
            type: Boolean,
            default: true,
          },
          isPaused: {
            type: Boolean,
            default: false,
          },
          priority: {
            type: Number,
            default: 0,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          lastUsed: {
            type: Date,
          },
          failureCount: {
            type: Number,
            default: 0,
          },
        },
      ],
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
