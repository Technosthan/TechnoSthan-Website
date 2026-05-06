import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const sendTelegramOtp = async (chatId, otp) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token not configured");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const message = `Your login OTP is: ${otp}. It expires in 10 minutes.`;
  await axios.post(url, { chat_id: chatId, text: message });
};
