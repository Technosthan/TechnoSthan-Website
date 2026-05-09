import mongoose from "mongoose";

const telegramLinkingCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Format: TECH-48291
      match: /^[A-Z]+-\d+$/,
    },
    chatId: {
      type: String,
      default: null,
    },
    telegramUsername: {
      type: String,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      sparse: true,
      trim: true,
    },
    linked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete after expiry
    },
  },
  { timestamps: true },
);

// Create TTL index for automatic cleanup
telegramLinkingCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TelegramLinkingCode = mongoose.model(
  "TelegramLinkingCode",
  telegramLinkingCodeSchema,
);

export default TelegramLinkingCode;
