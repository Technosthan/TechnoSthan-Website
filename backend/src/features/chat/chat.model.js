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
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
