import axios from "axios";
import { VertexAI } from "@google-cloud/vertexai";
import {
  getActiveProviders,
  getProviderWithDecryptedKey,
  markProviderFailed,
  markProviderSuccessful,
  getGlobalAISettings,
} from "../admin/aiProvider.service.js";
import { getAIResponse as getGeminiResponse } from "./gemini.service.js";

// Initialize Vertex AI (Gemini) only if project ID is available
let vertexAI = null;
try {
  if (process.env.GOOGLE_PROJECT_ID) {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.VERTEX_LOCATION || "us-central1",
    });
  }
} catch (error) {
  console.warn(
    "Vertex AI initialization in ai.service.js failed:",
    error.message,
  );
  vertexAI = null;
}

const normalizeResponse = (resp) => {
  try {
    return (
      resp?.data?.choices?.[0]?.message?.content ||
      resp?.data?.reply ||
      resp?.data?.output ||
      resp?.reply ||
      resp?.output ||
      null
    );
  } catch (e) {
    return null;
  }
};

// Call AI with specific provider
const callAIProvider = async (provider, messages, globalSettings) => {
  const { systemPrompt, temperature, maxTokens } = globalSettings;
  const providerWithKey = getProviderWithDecryptedKey(provider);

  if (!providerWithKey) {
    throw new Error("Provider configuration not found");
  }

  const { providerType, apiKey, modelName, apiUrl } = providerWithKey;

  if (providerType === "gemini") {
    // Check if Vertex AI is available
    if (!vertexAI) {
      throw new Error(
        "Vertex AI not configured. Please set GOOGLE_PROJECT_ID environment variable.",
      );
    }

    // Use Vertex AI
    const model = vertexAI.getGenerativeModel({
      model: modelName || "gemini-2.5-pro",
      systemInstruction: systemPrompt,
    });

    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    });

    const response = result.response;
    return (
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI"
    );
  }

  if (providerType === "openai") {
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const payload = {
      model: modelName || "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    };

    const response = await axios.post(
      apiUrl || "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    return normalizeResponse(response);
  }

  if (providerType === "custom") {
    if (!apiUrl) throw new Error("Custom API URL not configured");

    const payload = {
      model: modelName,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return normalizeResponse(response);
  }

  if (providerType === "token-only") {
    // For token-only providers, assume they use Bearer token auth
    if (!apiKey)
      throw new Error("API key not configured for token-only provider");

    const payload = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    };

    const response = await axios.post(
      apiUrl || "https://api.example.com/chat",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    return normalizeResponse(response);
  }

  throw new Error(`Unsupported provider type: ${providerType}`);
};

export const getAIResponse = async (message, history = []) => {
  try {
    // Get active providers based on mode
    const providers = await getActiveProviders();
    const globalSettings = await getGlobalAISettings();

    // If no providers configured, fall back to default Vertex AI
    if (providers.length === 0) {
      console.log(
        "No active AI providers configured, using default Vertex AI fallback",
      );
      return await getGeminiResponse(message, history);
    }

    // Build message list
    const messages = [];
    if (globalSettings.systemPrompt) {
      messages.push({ role: "system", content: globalSettings.systemPrompt });
    }

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((m) =>
        messages.push({ role: m.role, content: m.content }),
      );
    }
    messages.push({ role: "user", content: message });

    // Try providers in order (for fallback mode) or use single provider
    for (const provider of providers) {
      try {
        console.log(
          `Trying AI provider: ${provider.providerId} (${provider.providerType})`,
        );

        const response = await callAIProvider(
          provider,
          messages,
          globalSettings,
        );

        // Mark provider as successful
        await markProviderSuccessful(provider.providerId);

        return response;
      } catch (error) {
        console.error(`Provider ${provider.providerId} failed:`, error.message);

        // Mark provider as failed
        await markProviderFailed(provider.providerId);

        // If single provider mode, throw immediately
        if (globalSettings.mode === "single") {
          throw error;
        }

        // In fallback mode, continue to next provider
        continue;
      }
    }

    throw new Error("All AI providers failed");
  } catch (error) {
    console.error("AI response error:", error);
    throw new Error(`AI service unavailable: ${error.message}`);
  }
};

export const summarizeContent = async (content) => {
  try {
    const providers = await getActiveProviders();
    const globalSettings = await getGlobalAISettings();

    // 🔥 Updated strict prompt
    const summarySystemPrompt = `You are an AI assistant specialized in summarizing agricultural content.

Return ONLY valid JSON.
Do NOT include markdown, backticks, or any extra text.

Format strictly as:
{
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "shortSummary": "A 2-4 sentence summary"
}`;

    if (providers.length === 0) {
      console.log("Using Gemini fallback");
      return await getGeminiSummary(content, summarySystemPrompt);
    }

    const messages = [
      { role: "system", content: summarySystemPrompt },
      {
        role: "user",
        content: `Summarize the following content:\n\n${content}`,
      },
    ];

    for (const provider of providers) {
      try {
        const response = await callAIProvider(provider, messages, {
          ...globalSettings,
          systemPrompt: summarySystemPrompt,
        });

        await markProviderSuccessful(provider.providerId);

        // 🔥 FIX: Clean response before parsing
        const cleaned = response
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        try {
          const parsedResponse = JSON.parse(cleaned);
          return parsedResponse;
        } catch {
          return {
            keyPoints: [],
            shortSummary: cleaned,
          };
        }
      } catch (error) {
        await markProviderFailed(provider.providerId);

        if (globalSettings.mode === "single") {
          throw error;
        }
        continue;
      }
    }

    throw new Error("All AI providers failed");
  } catch (error) {
    console.error("AI summarization error:", error);

    return {
      keyPoints: [],
      shortSummary: "Unable to generate summary",
    };
  }
};



// 🔥 Gemini fallback (also fixed)
const getGeminiSummary = async (content, systemPrompt) => {
  try {
    if (!vertexAI) {
      throw new Error("Vertex AI not configured");
    }

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize the following content:\n\n${content}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
    });

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    // 🔥 FIX: Clean before parsing
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      return {
        keyPoints: [],
        shortSummary: cleaned,
      };
    }
  } catch (error) {
    console.error("Gemini error:", error);

    return {
      keyPoints: [],
      shortSummary: "Unable to generate summary",
    };
  }
};