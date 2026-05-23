import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn(
    "Resend email client is not configured. Set RESEND_API_KEY in your environment.",
  );
}

const resend = new Resend(apiKey);

export default resend;
