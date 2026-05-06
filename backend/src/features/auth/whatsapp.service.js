import twilio from "twilio";

let client = null;
const getTwilioClient = () => {
  if (
    !client &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN
  ) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  return client;
};

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

export const sendWhatsappOtp = async (to, otp) => {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    // Mock sending for development
    console.log(`Mock WhatsApp OTP sent to ${to}: ${otp}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }
  if (!TWILIO_WHATSAPP_NUMBER)
    throw new Error("Twilio WhatsApp number not configured");
  await twilioClient.messages.create({
    body: `Your login OTP is: ${otp}. It expires in 10 minutes.`,
    from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
  });
};
