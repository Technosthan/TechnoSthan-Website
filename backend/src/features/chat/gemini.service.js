import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = `
You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.
`;

export const getAIResponse = async (message, history = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  // Combine system prompt and user message
  const prompt = systemPrompt + "\nUser: " + message;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
