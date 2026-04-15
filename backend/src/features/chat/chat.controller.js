import { getAIResponse } from "./gemini.service.js";

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    const reply = await getAIResponse(message, history);

    res.json({
      success: true,
      data: reply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};