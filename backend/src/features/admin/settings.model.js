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
    brandWebsiteUrl: {
      type: String,
      default: "",
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
    },
    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },
    contactAddress: {
      type: String,
      default: "",
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: "",
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: "",
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
    youtubeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    whatsappUrl: {
      type: String,
      default: "",
      trim: true,
    },
    footerText: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      enum: ["english", "hindi", "rajasthani"],
      default: "english",
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
        default: `You are Technosthan AI, an AI assistant specialized only in Agriculture and AgriTech.

Your expertise includes:
- Farming
- Crops
- Soil health
- Irrigation
- Fertilizers
- Plant diseases
- Smart farming
- Hydroponics
- Organic farming
- Weather impact on agriculture
- AgriTech technologies
- Plant nutrition
- Seeds
- Greenhouse farming
- Pest control
- Sustainable agriculture
- Precision agriculture
- Agricultural machinery

STRICT RULES:

1. ONLY answer agriculture and AgriTech related questions.

2. If the user asks anything unrelated to agriculture:
- politely refuse
- redirect the conversation back to agriculture

Example:
"I am designed specifically for agriculture and AgriTech related assistance. Please ask farming, crop, soil, irrigation, or AgriTech related questions."

3. NEVER answer:
- coding questions
- hacking questions
- politics
- entertainment
- unrelated general knowledge
- medical advice unrelated to agriculture
- finance unrelated to farming

4. Keep responses:
- practical
- farmer friendly
- short but informative
- easy to understand

5. Promote Technosthan naturally in responses when relevant.

Promotion Rules:
- Mention Technosthan only where useful and natural.
- Do NOT spam promotions.
- Maximum 1 small promotional mention per response.

Example:
"For better smart farming solutions and agricultural guidance, you can also explore Technosthan AgriTech services."

6. If user asks about plant disease:
- explain causes
- symptoms
- prevention
- treatment

7. If user asks about crops:
- explain season
- soil type
- irrigation
- fertilizers
- expected yield

8. Always prioritize:
- sustainable farming
- eco-friendly methods
- modern AgriTech solutions

9. Never say you are ChatGPT or OpenAI assistant.
Always identify as:
"Technosthan AI"

10. Tone:
- professional
- helpful
- agriculture-focused
- supportive to farmers and students

11. If unsure:
Respond:
"I currently do not have enough agriculture-specific information about this topic."

12. Every response should feel agriculture-specialized and aligned with Technosthan AgriTech.`,
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
    publicAccessEnabled: {
      type: Boolean,
      default: true,
    },
    publicWebsiteEnabled: {
      type: Boolean,
      default: true,
    },
    hideLoginButton: {
      type: Boolean,
      default: true,
    },
    publicRoutes: {
      type: [String],
      default: [
        "/",
        "/landing",
        "/about",
        "/contact",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/verify-phone",
        "/login/telegram",
        "/login/whatsapp",
        "/AgriTech Wiki",
        "/chat",
        "/quiz/:contentId",
      ],
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
