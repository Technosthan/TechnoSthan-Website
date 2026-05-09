import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

export const sendTelegramOtp = async (chatId, otp) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token not configured");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const message = `Your login OTP is: ${otp}. It expires in 10 minutes.`;
  await axios.post(url, { chat_id: chatId, text: message });
};

/**
 * Send linking instructions to user
 */
export const sendLinkingInstructions = async (chatId) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token not configured");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const message = `
🔗 *Telegram Account Linking*

To link your Telegram account for OTP login:

1️⃣ Go to the AgriTech website
2️⃣ Click "Login with Telegram"
3️⃣ Enter your phone number
4️⃣ A linking code will be generated
5️⃣ Send me the command: \`/link CODE\`
   (Replace CODE with the actual code)

Example: \`/link TECH-48291\`

After linking, you'll receive OTP on Telegram for future logins!
  `;

  await axios.post(url, {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  });
};

/**
 * Send linking confirmation
 */
export const sendLinkingConfirmation = async (chatId, phoneNumber) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token not configured");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const message = `
✅ *Account Linked Successfully!*

Your phone number ${phoneNumber} is now linked to your Telegram account.

You can now login using Telegram OTP! 🎉
  `;

  await axios.post(url, {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  });
};

/**
 * Send error message
 */
export const sendErrorMessage = async (chatId, error) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token not configured");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const message = `❌ *Error*\n\n${error}`;

  await axios.post(url, {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  });
};
