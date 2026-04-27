const ALLOWED_PLATFORMS = ["linkedin", "facebook", "telegram"];

const normalizePlatform = (platform = "") => String(platform).toLowerCase().trim();

const assertSupportedPlatforms = (platforms = []) => {
  const invalidPlatforms = platforms.filter(
    (platform) => !ALLOWED_PLATFORMS.includes(normalizePlatform(platform))
  );

  if (invalidPlatforms.length > 0) {
    const message = `Unsupported platform(s): ${invalidPlatforms.join(", ")}`;
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const isUsableSecret = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return !(
    normalized.startsWith("your_") ||
    normalized.startsWith("paste_") ||
    normalized.includes("example") ||
    normalized.includes("placeholder")
  );
};

const parseTelegramConnectionToken = (token = "") => {
  const rawToken = String(token || "").trim();

  if (!rawToken) {
    return { botToken: "", chatId: "" };
  }

  try {
    const parsed = JSON.parse(rawToken);
    if (parsed && typeof parsed === "object") {
      return {
        botToken: String(parsed.botToken || parsed.token || "").trim(),
        chatId: String(parsed.chatId || parsed.chat_id || "").trim()
      };
    }
  } catch {
    // Fall through to legacy token formats below.
  }

  const pipeIndex = rawToken.indexOf("|");
  if (pipeIndex > 0) {
    return {
      botToken: rawToken.slice(0, pipeIndex).trim(),
      chatId: rawToken.slice(pipeIndex + 1).trim()
    };
  }

  return {
    botToken: rawToken,
    chatId: ""
  };
};

const normalizeTelegramBotToken = (value = "") => {
  const raw = String(value || "").trim();
  // Users often paste token as `bot<token>`; Telegram API URL already adds `bot`.
  return raw.replace(/^bot/i, "");
};

const sendToTelegram = async ({ token, message, type }) => {
  const connectionTelegram = parseTelegramConnectionToken(token);
  const botToken = normalizeTelegramBotToken(
    connectionTelegram.botToken || (isUsableSecret(process.env.TELEGRAM_BOT_TOKEN) ? process.env.TELEGRAM_BOT_TOKEN : "")
  );
  const chatId = connectionTelegram.chatId || (isUsableSecret(process.env.TELEGRAM_CHAT_ID) ? process.env.TELEGRAM_CHAT_ID : "");

  if (!botToken || !chatId) {
    return {
      success: false,
      detail: "Telegram is not configured. Provide botToken and chatId in connect settings or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID."
    };
  }

  const telegramText = type === "message" ? message : `[HR Post]\n${message}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const description = String(errorPayload?.description || "Telegram API request failed");

      if (/unauthorized/i.test(description)) {
        return {
          success: false,
          detail: "Telegram Unauthorized: Bot token invalid hai. BotFather se correct token copy karo (without leading `bot`)."
        };
      }

      return {
        success: false,
        detail: description
      };
    }

    return {
      success: true,
      detail: "Delivered via Telegram Bot API"
    };
  } catch (error) {
    return {
      success: false,
      detail: `Telegram API error: ${error.message}`
    };
  }
};

const sendToLinkedIn = async ({ token, message, type }) => {
  if (!token) {
    return {
      success: false,
      detail: "LinkedIn is not connected. OAuth token missing."
    };
  }

  const payload = {
    actionType: type,
    text: message,
    visibility: "PUBLIC"
  };

  return {
    success: true,
    detail: "LinkedIn payload prepared for OAuth publish flow",
    payload
  };
};

const sendToFacebook = async ({ token, message, type }) => {
  if (!token) {
    return {
      success: false,
      detail: "Facebook is not connected. Page access token missing."
    };
  }

  const payload = {
    message,
    mode: type
  };

  return {
    success: true,
    detail: "Facebook Graph API payload prepared",
    payload
  };
};

const dispatchByPlatform = async ({ platform, message, type, token }) => {
  if (platform === "telegram") {
    return sendToTelegram({ token, message, type });
  }

  if (platform === "linkedin") {
    return sendToLinkedIn({ token, message, type });
  }

  if (platform === "facebook") {
    return sendToFacebook({ token, message, type });
  }

  return {
    success: false,
    detail: `No dispatch implementation for ${platform}`
  };
};

module.exports = {
  ALLOWED_PLATFORMS,
  normalizePlatform,
  assertSupportedPlatforms,
  dispatchByPlatform
};
