const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const backendEnvPath = path.join(__dirname, "backend", ".env");
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";
const shouldUsePolling =
  process.env.TELEGRAM_USE_POLLING === "true" ||
  (!process.env.TELEGRAM_USE_POLLING &&
    /localhost|127\.0\.0\.1/i.test(BACKEND_API_URL));

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
let pollingOffset = 0;

if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "your_bot_token_here") {
  throw new Error(
    "Telegram bot token is missing. Set TELEGRAM_BOT_TOKEN in backend/.env or root .env.",
  );
}

/**
 * Send Telegram message
 */
const sendMessage = async (chatId, text, parseMode = "Markdown") => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error.message);
  }
};

/**
 * Handle /start command
 */
const handleStart = async (chatId, userName = null) => {
  const welcomeMessage = `
👋 *Welcome to AgriTech!*

I'm your Telegram bot. I can help you login securely using OTP.

*To link your account:*
1. Go to our website and click "Login with Telegram"
2. Enter your phone number
3. A linking code will be generated
4. Send me: \`/link CODE\` (e.g., /link TECH-48291)
5. You'll receive OTP on Telegram for future logins!

*Available Commands:*
• /start - Show this message
• /help - Get help
• /link CODE - Link your phone number
  `;

  await sendMessage(chatId, welcomeMessage);
};

/**
 * Handle /link command
 */
const handleLink = async (chatId, args, userName = null) => {
  if (!args || args.length === 0) {
    await sendMessage(
      chatId,
      `❌ *Invalid Format*\n\nUsage: /link CODE\nExample: /link TECH-48291`,
    );
    return;
  }

  const code = args[0].toUpperCase();

  // Validate code format
  if (!/^[A-Z]+-\d+$/.test(code)) {
    await sendMessage(
      chatId,
      `❌ *Invalid Code Format*\n\nCode should be like: TECH-48291`,
    );
    return;
  }

  try {
    // Send linking verification to backend
    const response = await axios.post(
      `${BACKEND_API_URL}/api/auth/telegram/verify-link`,
      {
        chatId,
        code,
        telegramUsername: userName || null,
      },
    );

    if (response.data.success) {
      await sendMessage(
        chatId,
        `✅ *Account Linked Successfully!*\n\nYour Telegram account is now linked. You can login using your phone number and receive OTP here! 🎉`,
      );
    }
  } catch (error) {
    console.error("Linking error:", error.response?.data || error.message);

    const errorMessage = error.response?.data?.message || error.message;
    await sendMessage(
      chatId,
      `❌ *Linking Failed*\n\n${errorMessage}\n\nPlease try again or contact support.`,
    );
  }
};

/**
 * Handle /help command
 */
const handleHelp = async (chatId) => {
  const helpMessage = `
ℹ️ *AgriTech Bot Help*

This bot helps you login securely using Telegram OTP.

*How it works:*
1. Visit our website and select "Login with Telegram"
2. Enter your phone number
3. You'll get a linking code (e.g., TECH-48291)
4. Send the command: /link TECH-48291
5. Your account will be linked
6. You'll receive OTP here for all future logins

*Commands:*
/start - Welcome message
/help - This message
/link CODE - Link your account

*Need help?*
Contact us at support@agritech.com
  `;

  await sendMessage(chatId, helpMessage);
};

const handleIncomingMessage = async (message) => {
  if (!message || !message.text || !message.chat) {
    return;
  }

  const chatId = message.chat.id;
  const userName = message.from?.username;
  const text = message.text.trim();

  console.log(`Message from ${chatId}: ${text}`);

  if (text.startsWith("/")) {
    const [command, ...args] = text.split(" ");

    switch (command.toLowerCase()) {
      case "/start":
        await handleStart(chatId, userName);
        break;
      case "/link":
        await handleLink(chatId, args, userName);
        break;
      case "/help":
        await handleHelp(chatId);
        break;
      default:
        await sendMessage(
          chatId,
          `Unknown command: ${command}\n\nType /help for available commands`,
        );
    }
  } else {
    await sendMessage(
      chatId,
      `I only understand commands.\n\nType /help to learn more or /start to begin.`,
    );
  }
};

const pollTelegramUpdates = async () => {
  try {
    const response = await axios.get(`${TELEGRAM_API}/getUpdates`, {
      params: {
        timeout: 30,
        offset: pollingOffset,
      },
    });

    const updates = response.data?.result || [];
    for (const update of updates) {
      pollingOffset = update.update_id + 1;
      if (update.message) {
        await handleIncomingMessage(update.message);
      }
    }
  } catch (error) {
    console.error(
      "Telegram polling error:",
      error.response?.data || error.message,
    );
  } finally {
    setTimeout(pollTelegramUpdates, 1000);
  }
};

// Handle incoming Telegram messages
app.post("/webhook/telegram", async (req, res) => {
  try {
    await handleIncomingMessage(req.body.message);
    res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Telegram webhook is running" });
});

// Start the server
const PORT = process.env.TELEGRAM_WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Telegram webhook server running on port ${PORT}`);
  console.log(
    `Webhook URL: https://your-domain.com/webhook/telegram or http://localhost:${PORT}/webhook/telegram`,
  );
  if (shouldUsePolling) {
    console.log("Telegram polling mode enabled for local development.");
    pollTelegramUpdates();
  }
});

module.exports = app;
