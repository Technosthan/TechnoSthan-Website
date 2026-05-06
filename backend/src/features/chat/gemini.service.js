import { VertexAI } from "@google-cloud/vertexai";
import Settings from "../admin/settings.model.js";

// Initialize Vertex AI only if project ID is available
let vertexAI = null;
try {
  if (process.env.GOOGLE_PROJECT_ID) {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-central1",
    });
  }
} catch (error) {
  console.warn("Vertex AI initialization failed:", error.message);
  vertexAI = null;
}

const getSettings = async () => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      aiSettings: {
        systemPrompt: `You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.`,
        temperature: 0.7,
        maxTokens: 3000,
      },
    };
  }
};

export const getAIResponse = async (message, history = []) => {
  try {
    // Check if Vertex AI is available
    if (!vertexAI) {
      throw new Error(
        "Vertex AI not configured. Please set GOOGLE_PROJECT_ID environment variable.",
      );
    }

    const settings = await getSettings();
    const { systemPrompt, temperature, maxTokens } = settings.aiSettings;

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: systemPrompt,
    });

    let contents = [];

    // Add history
    if (history.length > 0) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    console.log("Contents:", contents);

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Vertex AI error:", error);

    if (error.code === 7) {
      throw new Error(
        "API access forbidden. Check IAM roles or enable Vertex AI API.",
      );
    } else if (error.code === 8) {
      throw new Error("API quota exceeded. Try later.");
    } else {
      throw new Error("Failed to get AI response: " + error.message);
    }
  }
};
