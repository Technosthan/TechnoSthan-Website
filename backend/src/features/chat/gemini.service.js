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
        systemPrompt: `You are Technosthan AI, an AI assistant specialized only in Agriculture and AgriTech.

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
