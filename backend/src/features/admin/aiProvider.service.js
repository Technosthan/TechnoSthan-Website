import Settings from "./settings.model.js";
import crypto from "crypto";

// Encrypt API keys before storing
export const encryptApiKey = (apiKey) => {
  if (!apiKey) return "";
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || "default-key",
    "salt",
    32,
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// Decrypt API keys when retrieving
export const decryptApiKey = (encryptedApiKey) => {
  if (!encryptedApiKey) return "";
  try {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || "default-key",
      "salt",
      32,
    );
    const [ivHex, encrypted] = encryptedApiKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt API key:", error);
    return "";
  }
};

// Get active providers based on mode
export const getActiveProviders = async () => {
  try {
    const settings = await Settings.findOne()
      .select("+aiSettings.providers.apiKey")
      .lean();

    if (!settings || !settings.aiSettings) {
      return [];
    }

    const { mode, providers = [] } = settings.aiSettings;

    if (mode === "single") {
      // Return only the first active, non-paused provider
      const activeProvider = providers
        .filter((p) => p.isActive && !p.isPaused)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];

      return activeProvider ? [activeProvider] : [];
    } else if (mode === "fallback") {
      // Return all active, non-paused providers sorted by priority
      return providers
        .filter((p) => p.isActive && !p.isPaused)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    return [];
  } catch (error) {
    console.error("Error getting active providers:", error);
    return [];
  }
};

// Get provider with decrypted API key
export const getProviderWithDecryptedKey = (provider) => {
  if (!provider) return null;

  return {
    ...provider,
    apiKey: decryptApiKey(provider.apiKey),
  };
};

// Mark provider as failed (increment failure count)
export const markProviderFailed = async (providerId) => {
  try {
    await Settings.findOneAndUpdate(
      { "aiSettings.providers.providerId": providerId },
      {
        $inc: { "aiSettings.providers.$.failureCount": 1 },
        $set: { "aiSettings.providers.$.lastUsed": new Date() },
      },
    );
  } catch (error) {
    console.error("Error marking provider as failed:", error);
  }
};

// Mark provider as successful (reset failure count)
export const markProviderSuccessful = async (providerId) => {
  try {
    await Settings.findOneAndUpdate(
      { "aiSettings.providers.providerId": providerId },
      {
        $set: {
          "aiSettings.providers.$.failureCount": 0,
          "aiSettings.providers.$.lastUsed": new Date(),
        },
      },
    );
  } catch (error) {
    console.error("Error marking provider as successful:", error);
  }
};

// Get global AI settings (systemPrompt, temperature, maxTokens)
export const getGlobalAISettings = async () => {
  try {
    const settings = await Settings.findOne().lean();

    if (!settings || !settings.aiSettings) {
      return {
        systemPrompt: `You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.`,
        temperature: 0.7,
        maxTokens: 3000,
      };
    }

    return {
      systemPrompt: settings.aiSettings.systemPrompt,
      temperature: settings.aiSettings.temperature,
      maxTokens: settings.aiSettings.maxTokens,
    };
  } catch (error) {
    console.error("Error getting global AI settings:", error);
    return {
      systemPrompt: `You are an AI assistant specialized in agriculture (AgriTech).
Only answer agriculture-related questions like farming, soil, crops, irrigation.
If question is unrelated, politely refuse.`,
      temperature: 0.7,
      maxTokens: 3000,
    };
  }
};

// Parse config file JSON
export const parseConfigFile = (configFileContent) => {
  try {
    const config = JSON.parse(configFileContent);

    return {
      apiKey: config.apiKey || config.api_key || "",
      modelName: config.model || config.modelName || config.model_name || "",
      apiUrl:
        config.baseUrl ||
        config.apiUrl ||
        config.api_url ||
        config.base_url ||
        "",
    };
  } catch (error) {
    console.error("Error parsing config file:", error);
    return {};
  }
};
