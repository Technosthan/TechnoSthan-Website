import TelegramLinkingCode from "./telegramLinkingCode.model.js";
import User from "./user.model.js";

/**
 * Generate a unique linking code for Telegram
 * Format: TECH-XXXXX (e.g., TECH-48291)
 */
export const generateLinkingCode = async (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error("Phone number is required to generate a linking code");
  }

  const existingCode = await TelegramLinkingCode.findOne({
    phoneNumber,
    linked: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (existingCode) {
    return existingCode.code;
  }

  let code;
  let exists = true;

  // Generate unique code
  while (exists) {
    const randomNum = Math.floor(Math.random() * 100000);
    code = `TECH-${randomNum}`;
    exists = await TelegramLinkingCode.findOne({ code });
  }

  // Create linking code document with 15-minute expiry
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const linkingCode = new TelegramLinkingCode({
    code,
    chatId: null,
    phoneNumber,
    expiresAt,
  });

  await linkingCode.save();
  return code;
};

/**
 * Update linking code with chat ID and username when bot receives /start
 */
export const captureUserFromBotStart = async (
  chatId,
  telegramUsername = null,
) => {
  try {
    const existingUser = await User.findOne({ telegramChatId: chatId });
    if (existingUser) {
      return {
        status: "already_linked",
        message: "This Telegram account is already linked to a user account",
      };
    }

    return {
      status: "success",
      message: "Telegram chat captured successfully.",
      data: {
        chatId,
        telegramUsername,
      },
    };
  } catch (error) {
    throw new Error(`Failed to capture user from bot start: ${error.message}`);
  }
};

/**
 * Verify and execute the linking process
 * Called when user sends /link CODE to bot
 */
export const verifyAndLinkAccount = async (
  chatId,
  code,
  telegramUsername = null,
) => {
  try {
    const linkingCode = await TelegramLinkingCode.findOne({
      code: code.toUpperCase(),
    });

    if (!linkingCode) {
      throw new Error("Invalid linking code");
    }

    if (new Date() > linkingCode.expiresAt) {
      throw new Error("Linking code has expired");
    }

    if (linkingCode.linked) {
      throw new Error("This linking code has already been used");
    }

    if (linkingCode.chatId && linkingCode.chatId !== String(chatId)) {
      throw new Error("This linking code is already tied to another Telegram chat");
    }

    const existingChatUser = await User.findOne({ telegramChatId: String(chatId) });
    if (existingChatUser) {
      throw new Error("This Telegram account is already linked to a user account");
    }

    const user = await User.findOne({ mobile: linkingCode.phoneNumber });

    if (!user) {
      throw new Error(
        "No account found with this phone number. Please register first.",
      );
    }

    if (!user.phoneVerified) {
      throw new Error(
        "This phone number is not verified yet. Please verify your account first.",
      );
    }

    if (user.telegramChatId && user.telegramChatId !== String(chatId)) {
      throw new Error(
        "This phone number is already linked to another Telegram account",
      );
    }

    user.telegramChatId = String(chatId);
    user.telegramUsername = telegramUsername || linkingCode.telegramUsername;
    user.telegramLinked = true;
    user.telegramLinkCode = null;
    user.telegramLinkCodeExpires = null;
    await user.save();

    linkingCode.chatId = String(chatId);
    linkingCode.telegramUsername = telegramUsername || linkingCode.telegramUsername;
    linkingCode.linked = true;
    await linkingCode.save();

    return {
      status: "success",
      message: "Account successfully linked with Telegram",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        telegramLinked: true,
      },
    };
  } catch (error) {
    throw new Error(`Linking verification failed: ${error.message}`);
  }
};

/**
 * Check if phone number is linked with Telegram
 */
export const isPhoneLinkedWithTelegram = async (phoneNumber) => {
  try {
    const user = await User.findOne({ mobile: phoneNumber });

    if (!user) {
      return {
        linked: false,
        chatId: null,
      };
    }

    return {
      linked: user.telegramLinked && !!user.telegramChatId,
      chatId: user.telegramChatId,
      username: user.telegramUsername,
    };
  } catch (error) {
    throw new Error(`Failed to check phone linking: ${error.message}`);
  }
};

/**
 * Unlink Telegram account from phone number
 */
export const unlinkTelegramAccount = async (phoneNumber) => {
  try {
    const user = await User.findOne({ mobile: phoneNumber });

    if (!user) {
      throw new Error("User not found");
    }

    user.telegramChatId = null;
    user.telegramUsername = null;
    user.telegramLinked = false;
    user.telegramLinkCode = null;
    user.telegramLinkCodeExpires = null;
    await user.save();

    return {
      status: "success",
      message: "Telegram account unlinked successfully",
    };
  } catch (error) {
    throw new Error(`Failed to unlink Telegram account: ${error.message}`);
  }
};
