import { getAIResponse } from "./gemini.service.js";
import Chat from "./chat.model.js";

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;

    // Validation: Check if message is provided
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    const reply = await getAIResponse(message.trim(), history);

    // Save chat to database
    const chatEntry = new Chat({
      userId,
      message: message.trim(),
      response: reply,
    });

    await chatEntry.save();

    res.json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    // Handle specific error messages from service
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error.message.includes("API access forbidden")) {
      statusCode = 403;
      errorMessage = error.message;
    } else if (error.message.includes("API quota exceeded")) {
      statusCode = 429;
      errorMessage = error.message;
    } else if (
      error.message.includes("Internal server error from Google Cloud API")
    ) {
      statusCode = 500;
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
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
