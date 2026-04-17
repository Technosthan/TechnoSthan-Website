import { getAIResponse } from "./gemini.service.js";
import Chat from "./chat.model.js";

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;

    const reply = await getAIResponse(message, history);

    // Save chat to database
    const chatEntry = new Chat({
      userId,
      message,
      response: reply,
    });

    await chatEntry.save();

    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).limit(50); // Limit to last 50 chats

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};
