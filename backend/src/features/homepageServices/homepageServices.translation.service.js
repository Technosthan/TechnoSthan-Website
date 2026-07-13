import axios from "axios";
import crypto from "crypto";
import { VertexAI } from "@google-cloud/vertexai";
import {
  getActiveProviders,
  getProviderWithDecryptedKey,
  markProviderFailed,
  markProviderSuccessful,
} from "../admin/aiProvider.service.js";

const TRANSLATABLE_LANGUAGES = ["en", "hi", "rj"];
const LANGUAGE_LABELS = {
  en: "English",
  hi: "Hindi",
  rj: "Rajasthani",
};

let vertexAI = null;
try {
  if (process.env.GOOGLE_PROJECT_ID) {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.VERTEX_LOCATION || "us-central1",
    });
  }
} catch (error) {
  console.warn("[homepageServices.translation] Vertex init failed:", error.message);
  vertexAI = null;
}

const pendingRequests = new Map();

const normalizeJsonPayload = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  return raw
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
};

const extractJson = (value = "") => {
  const cleaned = normalizeJsonPayload(value);
  if (!cleaned) return null;

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = cleaned.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const buildTranslationPrompt = ({ sourceLanguage, service, languages }) => {
  const serviceLabel = LANGUAGE_LABELS[sourceLanguage] || "English";
  return [
    "You are a multilingual website translation engine for a premium Agritech website.",
    "Translate the provided service content into all requested languages.",
    "Preserve meaning, marketing tone, and button-friendly phrasing.",
    "Do not add explanations, markdown, or commentary.",
    "Return valid JSON only.",
    "",
    `Source language: ${serviceLabel}`,
    `Requested languages: ${languages.map((code) => `${code} (${LANGUAGE_LABELS[code]})`).join(", ")}`,
    "",
    "Input JSON:",
    JSON.stringify(service),
    "",
    "Output JSON shape:",
    `{
  "name": { "en": "", "hi": "", "rj": "" },
  "description": { "en": "", "hi": "", "rj": "" },
  "innerServices": [
    {
      "title": { "en": "", "hi": "", "rj": "" },
      "description": { "en": "", "hi": "", "rj": "" }
    }
  ]
}`,
  ].join("\n");
};

const callVertexTranslation = async (service, sourceLanguage, languages) => {
  if (!vertexAI) {
    throw new Error("Vertex AI not configured. Set GOOGLE_PROJECT_ID.");
  }

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-pro",
  });

  const prompt = buildTranslationPrompt({ sourceLanguage, service, languages });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const text =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = extractJson(text);
  if (!parsed) {
    throw new Error("Unable to parse translation response");
  }

  return parsed;
};

const callProviderTranslation = async (provider, service, sourceLanguage, languages) => {
  const providerWithKey = getProviderWithDecryptedKey(provider);
  if (!providerWithKey) {
    throw new Error("Provider configuration not found");
  }

  const { providerType, apiKey, modelName, apiUrl } = providerWithKey;
  const prompt = buildTranslationPrompt({ sourceLanguage, service, languages });

  if (providerType === "gemini") {
    return callVertexTranslation(service, sourceLanguage, languages);
  }

  if (providerType === "openai" && !apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  if (providerType === "custom" && !apiUrl) {
    throw new Error("Custom translation API URL not configured");
  }

  if (providerType === "token-only" && !apiUrl) {
    throw new Error("Token-only translation API URL not configured");
  }

  const payload =
    providerType === "openai" || providerType === "token-only"
      ? {
          model: modelName || "gpt-4o-mini",
          messages: [
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }
      : {
          model: modelName,
          messages: [
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        };

  const response = await axios.post(
    apiUrl ||
      (providerType === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://api.example.com/chat"),
    payload,
    {
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const text =
    response?.data?.choices?.[0]?.message?.content ||
    response?.data?.reply ||
    response?.data?.output ||
    response?.data?.data?.reply ||
    response?.data?.data?.output ||
    "";
  const parsed = extractJson(text);
  if (!parsed) {
    throw new Error("Unable to parse translation response");
  }

  return parsed;
};

const buildRequestKey = ({ sourceLanguage, service, languages }) =>
  crypto
    .createHash("sha1")
    .update(JSON.stringify({ sourceLanguage, service, languages }))
    .digest("hex");

const normalizeTranslationPayload = (payload = {}, languages = TRANSLATABLE_LANGUAGES) => {
  const normalized = {
    name: { en: "", hi: "", rj: "" },
    description: { en: "", hi: "", rj: "" },
    innerServices: [],
  };

  for (const language of languages) {
    normalized.name[language] = String(payload?.name?.[language] || "").trim();
    normalized.description[language] = String(payload?.description?.[language] || "").trim();
  }

  const innerServices = Array.isArray(payload?.innerServices) ? payload.innerServices : [];
  normalized.innerServices = innerServices.map((item) => {
    const title = { en: "", hi: "", rj: "" };
    const description = { en: "", hi: "", rj: "" };

    for (const language of languages) {
      title[language] = String(item?.title?.[language] || "").trim();
      description[language] = String(item?.description?.[language] || "").trim();
    }

    return { title, description };
  });

  return normalized;
};

export const translateHomepageServicePayload = async ({
  sourceLanguage = "en",
  service = {},
  languages = TRANSLATABLE_LANGUAGES,
} = {}) => {
  const requestKey = buildRequestKey({ sourceLanguage, service, languages });
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const task = (async () => {
    const providers = await getActiveProviders();

    if (providers.length === 0) {
      if (!vertexAI) {
        throw new Error(
          "Translation service is unavailable. Configure an AI provider or GOOGLE_PROJECT_ID.",
        );
      }

      return normalizeTranslationPayload(
        await callVertexTranslation(service, sourceLanguage, languages),
        languages,
      );
    }

    let lastError = null;
    for (const provider of providers) {
      try {
        const translated = await callProviderTranslation(
          provider,
          service,
          sourceLanguage,
          languages,
        );
        await markProviderSuccessful(provider.providerId);
        return normalizeTranslationPayload(translated, languages);
      } catch (error) {
        lastError = error;
        await markProviderFailed(provider.providerId);
        continue;
      }
    }

    throw new Error(
      lastError?.message || "Translation service is unavailable",
    );
  })();

  pendingRequests.set(requestKey, task);

  try {
    return await task;
  } finally {
    pendingRequests.delete(requestKey);
  }
};

export const SERVICE_TRANSLATION_LANGUAGES = TRANSLATABLE_LANGUAGES;
