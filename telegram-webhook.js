import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "./backend/node_modules/mongoose/index.js";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getOrCreateAuthSettings,
  getTelegramRuntimeSettings,
} from "./backend/src/features/admin/authSettings.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnvPath = path.join(__dirname, "backend", ".env");

if (existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

const app = express();
app.use(express.json());

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";
const TELEGRAM_USE_POLLING = String(process.env.TELEGRAM_USE_POLLING || "")
  .trim()
  .toLowerCase();
const shouldUsePolling =
  TELEGRAM_USE_POLLING === "true" ||
  (TELEGRAM_USE_POLLING === "" &&
    /localhost|127\.0\.0\.1/i.test(BACKEND_API_URL));

let dbReady = false;
let pollingOffset = 0;

const ensureDatabaseConnection = async () => {
  if (dbReady && mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to load Telegram settings");
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  await getOrCreateAuthSettings({ includeSensitive: true });
  dbReady = true;
};

const getTelegramApiBase = async () => {
  await ensureDatabaseConnection();
  const telegramSettings = await getTelegramRuntimeSettings();

  if (!telegramSettings.enabled) {
    throw new Error("Telegram login is disabled");
  }

  if (!telegramSettings.botToken) {
    throw new Error("Telegram bot token is missing in authentication settings");
  }

  return `https://api.telegram.org/bot${telegramSettings.botToken}`;
};

const sendMessage = async (chatId, text, parseMode = "Markdown") => {
  try {
    const telegramApiBase = await getTelegramApiBase();
    await axios.post(`${telegramApiBase}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
  } catch (error) {
    console.error(
      "Error sending Telegram message:",
      error.response?.data || error.message,
    );
  }
};

const handleStart = async (chatId) => {
  const welcomeMessage = `
Welcome to AgriTech!

I'm your Telegram bot. I can help you login securely using OTP.

To link your account:
1. Go to our website and click "Login with Telegram"
2. Enter your phone number
3. A linking code will be generated
4. Send me: \`/link CODE\` (example: /link TECH-48291)
5. You'll receive OTP here for future logins

Available Commands:
/start - Show this message
/help - Get help
/link CODE - Link your phone number
  `;

  await sendMessage(chatId, welcomeMessage);
};

const handleLink = async (chatId, args, userName = null) => {
  if (!args || args.length === 0) {
    await sendMessage(
      chatId,
      `Invalid format\n\nUsage: /link CODE\nExample: /link TECH-48291`,
    );
    return;
  }

  const code = args[0].toUpperCase();

  if (!/^[A-Z]+-\d+$/.test(code)) {
    await sendMessage(
      chatId,
      "Invalid code format\n\nCode should look like TECH-48291",
    );
    return;
  }

  try {
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
        "Account linked successfully.\n\nYour Telegram account is ready for OTP login.",
      );
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("Linking error:", error.response?.data || error.message);
    await sendMessage(
      chatId,
      `Linking failed\n\n${errorMessage}\n\nPlease try again or contact support.`,
    );
  }
};

const handleHelp = async (chatId) => {
  const helpMessage = `
AgriTech Bot Help

This bot helps you login securely using Telegram OTP.

How it works:
1. Visit our website and select "Login with Telegram"
2. Enter your phone number
3. You will get a linking code
4. Send /link YOUR_CODE here
5. Your account will be linked and future OTPs arrive in Telegram

Commands:
/start - Welcome message
/help - This message
/link CODE - Link your account
  `;

  await sendMessage(chatId, helpMessage);
};

const handleIncomingMessage = async (message) => {
  if (!message?.text || !message.chat) {
    return;
  }

  const chatId = message.chat.id;
  const userName = message.from?.username;
  const text = message.text.trim();

  console.log(`Message from ${chatId}: ${text}`);

  if (!text.startsWith("/")) {
    await sendMessage(
      chatId,
      "I only understand commands.\n\nType /help to learn more or /start to begin.",
    );
    return;
  }

  const [command, ...args] = text.split(" ");

  switch (command.toLowerCase()) {
    case "/start":
      await handleStart(chatId);
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
      break;
  }
};

const pollTelegramUpdates = async () => {
  try {
    const telegramApiBase = await getTelegramApiBase();
    const response = await axios.get(`${telegramApiBase}/getUpdates`, {
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

app.post("/webhook/telegram", async (req, res) => {
  try {
    await handleIncomingMessage(req.body.message);
    res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.sendStatus(500);
  }
});

app.get("/health", async (req, res) => {
  try {
    const telegramSettings = await getTelegramRuntimeSettings();
    res.json({
      status: "ok",
      message: "Telegram webhook is running",
      telegramEnabled: telegramSettings.enabled,
      botUsername: telegramSettings.botUsername,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

const PORT = process.env.TELEGRAM_WEBHOOK_PORT || 3001;

ensureDatabaseConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Telegram webhook server running on port ${PORT} (${shouldUsePolling ? "polling" : "webhook"} mode)`,
      );
      console.log(
        `Webhook URL: ${BACKEND_API_URL}/webhook/telegram or http://localhost:${PORT}/webhook/telegram`,
      );
      if (!shouldUsePolling) {
        console.log(
          "Telegram is configured for webhook mode. Ensure your bot webhook is set to the URL above or use TELEGRAM_USE_POLLING=true for local development.",
        );
      }

      if (shouldUsePolling) {
        console.log("Telegram polling mode enabled for local development.");
        pollTelegramUpdates();
      }
    });
  })
  .catch((error) => {
    console.error("Failed to start Telegram webhook server:", error.message);
    process.exit(1);
  });

export default app;
