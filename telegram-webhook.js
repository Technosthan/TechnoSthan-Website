const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Store linking codes temporarily (in production, use Redis or database)
const linkingCodes = new Map();

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
        phoneNumber: null, // Backend will handle this based on code
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

// Handle incoming Telegram messages
app.post("/webhook/telegram", async (req, res) => {
  try {
    const { message, update_id } = req.body;

    if (!message || !message.text || !message.chat) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const userName = message.from?.username;
    const text = message.text.trim();

    console.log(`Message from ${chatId}: ${text}`);

    // Handle commands
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
      // Send help if not a command
      await sendMessage(
        chatId,
        `I only understand commands.\n\nType /help to learn more or /start to begin.`,
      );
    }

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
});

module.exports = app;

app.listen(3001, () => {
  console.log("Telegram webhook server running on port 3001");
});
