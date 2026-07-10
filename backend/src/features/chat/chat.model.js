import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    file: {
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
      asset: {
        url: String,
        secureUrl: String,
        publicId: String,
        resourceType: String,
        format: String,
        originalName: String,
        mimeType: String,
        size: Number,
        bytes: Number,
        width: Number,
        height: Number,
        version: Number,
        folder: String,
      },
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
