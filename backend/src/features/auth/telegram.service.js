import axios from "axios";
import {
  getOtpSecuritySettings,
  getTelegramRuntimeSettings,
} from "../admin/authSettings.service.js";

const sendTelegramMessage = async (chatId, text, parseMode = "Markdown") => {
  const telegramSettings = await getTelegramRuntimeSettings();

  if (!telegramSettings.enabled) {
    throw new Error("Telegram login is currently disabled");
  }

  if (!telegramSettings.botToken) {
    throw new Error("Telegram bot token not configured");
  }

  const url = `https://api.telegram.org/bot${telegramSettings.botToken}/sendMessage`;

  await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  });
};

export const sendTelegramOtp = async (chatId, otp) => {
  const otpSecurity = await getOtpSecuritySettings();
  const message = `Your login OTP is: ${otp}. It expires in ${otpSecurity.expiryMinutes} minute${otpSecurity.expiryMinutes === 1 ? "" : "s"}.`;
  await sendTelegramMessage(chatId, message, undefined);
};

export const sendLinkingInstructions = async (chatId) => {
  const message = `
Telegram Account Linking

To link your Telegram account for OTP login:

1. Go to the AgriTech website
2. Click "Login with Telegram"
3. Enter your phone number
4. A linking code will be generated
5. Send me the command: \`/link CODE\`
   (Replace CODE with the actual code)

Example: \`/link TECH-48291\`

After linking, you'll receive OTP on Telegram for future logins!
  `;

  await sendTelegramMessage(chatId, message);
};

export const sendLinkingConfirmation = async (chatId, phoneNumber) => {
  const message = `
Account Linked Successfully!

Your phone number ${phoneNumber} is now linked to your Telegram account.

You can now login using Telegram OTP!
  `;

  await sendTelegramMessage(chatId, message);
};

export const sendErrorMessage = async (chatId, error) => {
  const message = `Error\n\n${error}`;
  await sendTelegramMessage(chatId, message);
};
