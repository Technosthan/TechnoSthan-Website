import AuthSettings from "./authSettings.model.js";

export const AUTH_SETTINGS_DEFAULTS = {
  whatsapp: {
    enabled: true,
    accessToken: "",
    phoneNumberId: "",
    verifyToken: "",
    templateName: "otp_verification",
    businessAccountId: "",
  },
  telegram: {
    enabled: true,
    botToken: "",
    botUsername: "",
    webhookUrl: "",
  },
  otpSecurity: {
    expiryMinutes: 5,
    resendCooldown: 60,
    maxAttempts: 5,
    maxDailyRequests: 10,
  },
};

const MASK_VALUE = "***";

export const mergeAuthSettings = (settings = {}) => ({
  ...AUTH_SETTINGS_DEFAULTS,
  ...settings,
  whatsapp: {
    ...AUTH_SETTINGS_DEFAULTS.whatsapp,
    ...(settings.whatsapp || {}),
  },
  telegram: {
    ...AUTH_SETTINGS_DEFAULTS.telegram,
    ...(settings.telegram || {}),
  },
  otpSecurity: {
    ...AUTH_SETTINGS_DEFAULTS.otpSecurity,
    ...(settings.otpSecurity || {}),
  },
});

export const sanitizeAuthSettings = (settings = {}) => {
  const merged = mergeAuthSettings(settings);

  return {
    ...merged,
    whatsapp: {
      ...merged.whatsapp,
      accessToken: merged.whatsapp.accessToken ? MASK_VALUE : "",
      verifyToken: merged.whatsapp.verifyToken ? MASK_VALUE : "",
    },
    telegram: {
      ...merged.telegram,
      botToken: merged.telegram.botToken ? MASK_VALUE : "",
    },
  };
};

export const getOrCreateAuthSettings = async ({
  includeSensitive = false,
} = {}) => {
  const select = includeSensitive
    ? "+whatsapp.accessToken +whatsapp.verifyToken +telegram.botToken"
    : "";

  let authSettings = await AuthSettings.findOne()
    .select(select)
    .lean({ virtuals: false });

  if (!authSettings) {
    const created = await AuthSettings.create({});
    authSettings = includeSensitive
      ? await AuthSettings.findById(created._id)
          .select(select)
          .lean({ virtuals: false })
      : created.toObject();
  }

  return mergeAuthSettings(authSettings);
};

export const getWhatsappRuntimeSettings = async () => {
  const settings = await getOrCreateAuthSettings({ includeSensitive: true });
  return settings.whatsapp;
};

export const getTelegramRuntimeSettings = async () => {
  const settings = await getOrCreateAuthSettings({ includeSensitive: true });
  return settings.telegram;
};

export const getOtpSecuritySettings = async () => {
  const settings = await getOrCreateAuthSettings();
  return settings.otpSecurity;
};

export const buildAuthSettingsUpdate = (payload = {}, existing = {}) => {
  const mergedExisting = mergeAuthSettings(existing);

  const nextSettings = mergeAuthSettings({
    ...mergedExisting,
    whatsapp: {
      ...mergedExisting.whatsapp,
      ...(payload.whatsapp || {}),
    },
    telegram: {
      ...mergedExisting.telegram,
      ...(payload.telegram || {}),
    },
    otpSecurity: {
      ...mergedExisting.otpSecurity,
      ...(payload.otpSecurity || {}),
    },
  });

  if (payload.whatsapp) {
    if (payload.whatsapp.accessToken === MASK_VALUE) {
      nextSettings.whatsapp.accessToken = mergedExisting.whatsapp.accessToken;
    }
    if (payload.whatsapp.verifyToken === MASK_VALUE) {
      nextSettings.whatsapp.verifyToken = mergedExisting.whatsapp.verifyToken;
    }
  }

  if (payload.telegram && payload.telegram.botToken === MASK_VALUE) {
    nextSettings.telegram.botToken = mergedExisting.telegram.botToken;
  }

  return nextSettings;
};

export const validateAuthSettingsPayload = (payload = {}) => {
  const allowedSections = ["whatsapp", "telegram", "otpSecurity"];
  const sectionKeys = Object.keys(payload);

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Invalid request body. Expected an object.";
  }

  for (const section of sectionKeys) {
    if (!allowedSections.includes(section)) {
      return `Invalid section: ${section}. Allowed: ${allowedSections.join(", ")}`;
    }
  }

  const { whatsapp, telegram, otpSecurity } = payload;

  if (whatsapp) {
    if (
      whatsapp.enabled &&
      (!String(whatsapp.accessToken || "").trim() ||
        !String(whatsapp.phoneNumberId || "").trim() ||
        !String(whatsapp.verifyToken || "").trim() ||
        !String(whatsapp.templateName || "").trim())
    ) {
      return "WhatsApp access token, phone number ID, verify token, and template name are required when WhatsApp login is enabled";
    }
  }

  if (telegram) {
    if (
      telegram.enabled &&
      (!String(telegram.botToken || "").trim() ||
        !String(telegram.botUsername || "").trim())
    ) {
      return "Telegram bot token and bot username are required when Telegram login is enabled";
    }

    if (telegram.webhookUrl) {
      try {
        new URL(telegram.webhookUrl);
      } catch {
        return "Telegram webhook URL must be a valid URL";
      }
    }
  }

  if (otpSecurity) {
    const validations = [
      ["expiryMinutes", 1, 60, "OTP expiry minutes must be between 1 and 60"],
      [
        "resendCooldown",
        30,
        300,
        "Resend cooldown must be between 30 and 300 seconds",
      ],
      ["maxAttempts", 1, 10, "Max attempts must be between 1 and 10"],
      [
        "maxDailyRequests",
        1,
        50,
        "Max daily requests must be between 1 and 50",
      ],
    ];

    for (const [key, min, max, message] of validations) {
      if (otpSecurity[key] !== undefined) {
        const value = Number(otpSecurity[key]);
        if (!Number.isInteger(value) || value < min || value > max) {
          return message;
        }
      }
    }
  }

  return null;
};
