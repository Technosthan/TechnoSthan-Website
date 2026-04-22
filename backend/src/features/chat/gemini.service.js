import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = `
You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.
`;

export const getAIResponse = async (message, history = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Start with system prompt
    let prompt = systemPrompt;

    // Add history if provided
    if (history.length > 0) {
      history.forEach((msg) => {
        prompt += `\n${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`;
      });
    }

    // Add current user message
    prompt += `\nUser: ${message}`;

    console.log("Prompt:", prompt); // Add logging

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);

    // Handle specific error codes
    if (error.status === 403) {
      throw new Error(
        "API access forbidden. Please check your Google Cloud API key and ensure the Generative Language API is enabled.",
      );
    } else if (error.status === 429) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (error.status === 500) {
      throw new Error(
        "Internal server error from Google Cloud API. Please try again later.",
      );
    } else {
      throw new Error("Failed to get AI response: " + error.message);
    }
  }
};
