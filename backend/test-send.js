require("dotenv").config({ path: __dirname + "/.env" });
const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const rawPass = process.env.EMAIL_PASS || "";

if (!user) {
  console.error("EMAIL_USER not set in .env");
  process.exit(1);
}

const trySend = async (pass, label) => {
  console.log(`Trying send with ${label}`);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    console.log("SMTP verify OK");
    const info = await transporter.sendMail({
      from: `${user}`,
      to: user,
      subject: "Test email from local test-send.js",
      text: `Test send at ${new Date().toISOString()} using ${label}`,
    });
    console.log("Send result:", info);
    return true;
  } catch (err) {
    console.error("Send failed:", err && err.message ? err.message : err);
    return false;
  }
};

(async () => {
  const triedOriginal = await trySend(rawPass, "original password");
  if (!triedOriginal) {
    const compact = rawPass.replace(/\s+/g, "");
    if (compact !== rawPass) {
      await trySend(compact, "password without spaces");
    }
  }
})();
