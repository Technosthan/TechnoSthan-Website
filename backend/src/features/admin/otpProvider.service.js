import axios from "axios";
import nodemailer from "nodemailer";
import twilio from "twilio";
import {
  SESClient,
  SendEmailCommand,
  GetSendQuotaCommand,
} from "@aws-sdk/client-ses";
import OtpEmailProvider from "./otpEmailProvider.model.js";
import OtpPhoneProvider from "./otpPhoneProvider.model.js";
import AuthSettings from "./authSettings.model.js";
import { OtpManager } from "../../services/otp/otpManager.js";

const MASK_VALUE = "***";

const createEmailProviderMask = (provider) => {
  if (!provider) return provider;
  const record = provider.toObject ? provider.toObject() : { ...provider };

  return {
    ...record,
    password: record.password ? MASK_VALUE : "",
    apiKey: record.apiKey ? MASK_VALUE : "",
    accessKey: record.accessKey ? MASK_VALUE : "",
    secretKey: record.secretKey ? MASK_VALUE : "",
  };
};

const createPhoneProviderMask = (provider) => {
  if (!provider) return provider;
  const record = provider.toObject ? provider.toObject() : { ...provider };
  return {
    ...record,
    twilioAccountSid: record.twilioAccountSid ? MASK_VALUE : "",
    twilioAuthToken: record.twilioAuthToken ? MASK_VALUE : "",
    msg91AuthKey: record.msg91AuthKey ? MASK_VALUE : "",
    firebaseApiKey: record.firebaseApiKey ? MASK_VALUE : "",
    whatsappAccessToken: record.whatsappAccessToken ? MASK_VALUE : "",
    whatsappVerifyToken: record.whatsappVerifyToken ? MASK_VALUE : "",
    vonageApiKey: record.vonageApiKey ? MASK_VALUE : "",
    vonageApiSecret: record.vonageApiSecret ? MASK_VALUE : "",
    customApiAuthKey: record.customApiAuthKey ? MASK_VALUE : "",
  };
};

const sanitizePayloadValue = (value, existingValue) => {
  if (value === MASK_VALUE) {
    return existingValue;
  }
  return value;
};

const normalizeProviderStatus = (status) =>
  status === "active" ? "active" : "inactive";

const applyEmailProviderDefaults = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const normalized = { ...payload };

  if (normalized.providerType === "gmail_smtp") {
    if (!normalized.host?.trim()) {
      normalized.host = "smtp.gmail.com";
    }
    if (!normalized.port) {
      normalized.port = 587;
    }
    if (!normalized.encryption) {
      normalized.encryption = "tls";
    }
  }

  return normalized;
};

const validateEmailProviderPayload = (payload, options = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid email provider payload");
  }

  const { providerName, providerType, status } = payload;

  if (!providerName || !providerName.trim()) {
    throw new Error("Provider name is required");
  }
  if (!providerType) {
    throw new Error("Provider type is required");
  }

  const active = normalizeProviderStatus(status) === "active";

  switch (providerType) {
    case "smtp":
    case "gmail_smtp":
    case "custom_smtp": {
      if (active) {
        if (!payload.host?.trim()) throw new Error("SMTP host is required");
        if (!payload.port) throw new Error("SMTP port is required");
        if (!payload.username?.trim())
          throw new Error("SMTP username is required");
        if (!payload.password?.trim() && !options.keepExistingPassword)
          throw new Error("SMTP password is required");
      }
      break;
    }
    case "sendgrid": {
      if (active) {
        if (!payload.apiKey?.trim())
          throw new Error("SendGrid API key is required");
        if (!payload.senderEmail?.trim())
          throw new Error("SendGrid sender email is required");
      }
      break;
    }
    case "resend": {
      if (active) {
        if (!payload.apiKey?.trim())
          throw new Error("Resend API key is required");
        if (!payload.fromEmail?.trim())
          throw new Error("Resend from email is required");
      }
      break;
    }
    case "mailgun": {
      if (active) {
        if (!payload.apiKey?.trim())
          throw new Error("Mailgun API key is required");
        if (!payload.domain?.trim())
          throw new Error("Mailgun domain is required");
        if (!payload.senderEmail?.trim())
          throw new Error("Mailgun sender email is required");
      }
      break;
    }
    case "aws_ses": {
      if (active) {
        if (!payload.accessKey?.trim())
          throw new Error("AWS SES access key is required");
        if (!payload.secretKey?.trim())
          throw new Error("AWS SES secret key is required");
        if (!payload.region?.trim())
          throw new Error("AWS SES region is required");
        if (!payload.senderEmail?.trim())
          throw new Error("AWS SES sender email is required");
      }
      break;
    }
    default:
      throw new Error(`Unsupported email provider type: ${providerType}`);
  }
};

const validatePhoneProviderPayload = (payload, options = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid phone provider payload");
  }

  const { providerName, providerType, status } = payload;
  if (!providerName || !providerName.trim()) {
    throw new Error("Provider name is required");
  }
  if (!providerType) {
    throw new Error("Provider type is required");
  }

  const active = normalizeProviderStatus(status) === "active";
  switch (providerType) {
    case "twilio": {
      if (active) {
        if (!payload.twilioAccountSid?.trim())
          throw new Error("Twilio SID is required");
        if (!payload.twilioAuthToken?.trim())
          throw new Error("Twilio auth token is required");
        if (!payload.twilioPhoneNumber?.trim())
          throw new Error("Twilio phone number is required");
      }
      break;
    }
    case "msg91": {
      if (active) {
        if (!payload.msg91AuthKey?.trim())
          throw new Error("MSG91 auth key is required");
        if (!payload.msg91TemplateId?.trim())
          throw new Error("MSG91 template ID is required");
      }
      break;
    }
    case "firebase": {
      if (active) {
        if (!payload.firebaseApiKey?.trim())
          throw new Error("Firebase API key is required");
        if (
          !payload.firebaseConfig ||
          typeof payload.firebaseConfig !== "object"
        ) {
          throw new Error("Firebase config is required");
        }
      }
      break;
    }
    case "whatsapp": {
      if (active) {
        if (!payload.whatsappAccessToken?.trim())
          throw new Error("WhatsApp access token is required");
        if (!payload.whatsappPhoneNumberId?.trim())
          throw new Error("WhatsApp phone number ID is required");
        if (!payload.whatsappVerifyToken?.trim())
          throw new Error("WhatsApp verify token is required");
      }
      break;
    }
    case "vonage": {
      if (active) {
        if (!payload.vonageApiKey?.trim())
          throw new Error("Vonage API key is required");
        if (!payload.vonageApiSecret?.trim())
          throw new Error("Vonage API secret is required");
        if (!payload.vonageFromNumber?.trim())
          throw new Error("Vonage from number is required");
      }
      break;
    }
    case "custom_api": {
      if (active) {
        if (!payload.customApiEndpoint?.trim())
          throw new Error("Custom API endpoint is required");
        if (!payload.customApiPayloadTemplate?.trim())
          throw new Error("Custom API payload template is required");
      }
      break;
    }
    default:
      throw new Error(`Unsupported phone provider type: ${providerType}`);
  }
};

const buildProviderSecrets = (payload = {}, existing = {}) => {
  return {
    ...payload,
    password: sanitizePayloadValue(payload.password, existing.password),
    apiKey: sanitizePayloadValue(payload.apiKey, existing.apiKey),
    accessKey: sanitizePayloadValue(payload.accessKey, existing.accessKey),
    secretKey: sanitizePayloadValue(payload.secretKey, existing.secretKey),
    twilioAccountSid: sanitizePayloadValue(
      payload.twilioAccountSid,
      existing.twilioAccountSid,
    ),
    twilioAuthToken: sanitizePayloadValue(
      payload.twilioAuthToken,
      existing.twilioAuthToken,
    ),
    msg91AuthKey: sanitizePayloadValue(
      payload.msg91AuthKey,
      existing.msg91AuthKey,
    ),
    firebaseApiKey: sanitizePayloadValue(
      payload.firebaseApiKey,
      existing.firebaseApiKey,
    ),
    firebaseRecaptchaToken: sanitizePayloadValue(
      payload.firebaseRecaptchaToken,
      existing.firebaseRecaptchaToken,
    ),
    whatsappAccessToken: sanitizePayloadValue(
      payload.whatsappAccessToken,
      existing.whatsappAccessToken,
    ),
    whatsappVerifyToken: sanitizePayloadValue(
      payload.whatsappVerifyToken,
      existing.whatsappVerifyToken,
    ),
    vonageApiKey: sanitizePayloadValue(
      payload.vonageApiKey,
      existing.vonageApiKey,
    ),
    vonageApiSecret: sanitizePayloadValue(
      payload.vonageApiSecret,
      existing.vonageApiSecret,
    ),
    customApiAuthKey: sanitizePayloadValue(
      payload.customApiAuthKey,
      existing.customApiAuthKey,
    ),
  };
};

const getActiveEmailProvider = async () => {
  return await OtpEmailProvider.findOne({
    status: "active",
    isDeleted: false,
  })
    .sort({ isDefault: -1 })
    .select("+password +apiKey +accessKey +secretKey");
};

const getActivePhoneProvider = async () => {
  return await OtpPhoneProvider.findOne({
    status: "active",
    isDeleted: false,
  })
    .sort({ isDefault: -1 })
    .select(
      "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +firebaseRecaptchaToken +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
    );
};

const resolvePhoneProviderForMethod = async (method) => {
  const provider = await getActivePhoneProvider();
  if (!provider) {
    throw new Error("No active phone provider configured");
  }

  const smsProviders = ["twilio", "msg91", "vonage", "custom_api", "firebase"];
  const whatsappProviders = ["whatsapp", "custom_api"];

  if (method === "sms") {
    if (!smsProviders.includes(provider.providerType)) {
      throw new Error(
        `Active phone provider (${provider.providerType}) cannot deliver SMS messages`,
      );
    }
    return provider;
  }

  if (method === "whatsapp") {
    if (!whatsappProviders.includes(provider.providerType)) {
      throw new Error(
        `Active phone provider (${provider.providerType}) cannot deliver WhatsApp messages`,
      );
    }
    return provider;
  }

  return provider;
};

const sendPhoneViaFirebase = async (provider, phone, otp) => {
  if (!provider.firebaseApiKey?.trim()) {
    throw new Error("Firebase API key is required");
  }
  if (!provider.firebaseRecaptchaToken?.trim()) {
    throw new Error("Firebase reCAPTCHA token is required to send OTP");
  }
  // Firebase requires E.164 format: +919636376269
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log(`Firebase send: normalized ${phone} to ${normalizedPhone}`);

  const payload = {
    phoneNumber: normalizedPhone,
    recaptchaToken: provider.firebaseRecaptchaToken,
  };
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${encodeURIComponent(
    provider.firebaseApiKey,
  )}`;
  try {
    const resp = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Firebase send response:", resp.status, resp.data);
    return resp.data;
  } catch (err) {
    console.error("Firebase send error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      provider: {
        projectId: provider.firebaseConfig?.projectId,
        keyPresent: !!provider.firebaseApiKey,
        recaptchaPresent: !!provider.firebaseRecaptchaToken,
      },
    });
    throw new Error(
      `Firebase OTP send failed: ${err.response?.status || "network"} - ${
        err.response?.data?.error?.message || err.message
      }`,
    );
  }
};

const sendPhoneOtpViaActiveProvider = async (phone, otp, method = "sms") => {
  const provider = await resolvePhoneProviderForMethod(method);
  return await sendPhoneViaProvider(provider, phone, otp);
};

const verifySmtpProvider = async (provider) => {
  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: Number(provider.port) || 587,
    secure: provider.encryption === "ssl",
    auth: {
      user: provider.username,
      pass: provider.password,
    },
    tls:
      provider.encryption === "none"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  await transporter.verify();
};

const sendEmailViaSmtp = async (provider, { to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: Number(provider.port) || 587,
    secure: provider.encryption === "ssl",
    auth: {
      user: provider.username,
      pass: provider.password,
    },
    tls:
      provider.encryption === "none"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const from =
    provider.senderEmail || provider.fromEmail || process.env.EMAIL_FROM;
  const message = { from, to, subject, html, text };
  const result = await transporter.sendMail(message);
  return result;
};

const sendEmailViaSendGrid = async (provider, { to, subject, html, text }) => {
  const url = "https://api.sendgrid.com/v3/mail/send";
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: {
      email:
        provider.senderEmail || provider.fromEmail || process.env.EMAIL_FROM,
    },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
  };
  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
  });
};

const sendEmailViaResend = async (provider, { to, subject, html, text }) => {
  const url = "https://api.resend.com/v1/emails";
  const payload = {
    from: provider.fromEmail || provider.senderEmail || process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };
  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
  });
};

const verifyResendProvider = async (provider) => {
  if (!provider.apiKey) throw new Error("Resend API key is required");
  await axios.get("https://api.resend.com/v1/", {
    headers: { Authorization: `Bearer ${provider.apiKey}` },
  });
};

const sendEmailViaMailgun = async (provider, { to, subject, html, text }) => {
  const url = `https://api.mailgun.net/v3/${provider.domain}/messages`;
  const data = new URLSearchParams();
  data.append(
    "from",
    provider.senderEmail || provider.fromEmail || process.env.EMAIL_FROM,
  );
  data.append("to", to);
  data.append("subject", subject);
  data.append("text", text);
  data.append("html", html);

  await axios.post(url, data.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${provider.apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

const verifyMailgunProvider = async (provider) => {
  if (!provider.apiKey || !provider.domain)
    throw new Error("Mailgun API key and domain are required");
  await axios.get(`https://api.mailgun.net/v3/domains/${provider.domain}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${provider.apiKey}`).toString("base64")}`,
    },
  });
};

const sendEmailViaSes = async (provider, { to, subject, html, text }) => {
  const ses = new SESClient({
    region: provider.region,
    credentials: {
      accessKeyId: provider.accessKey,
      secretAccessKey: provider.secretKey,
    },
  });

  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: html },
        Text: { Charset: "UTF-8", Data: text },
      },
      Subject: { Charset: "UTF-8", Data: subject },
    },
    Source:
      provider.senderEmail || provider.fromEmail || process.env.EMAIL_FROM,
  };
  await ses.send(new SendEmailCommand(params));
};

const verifySesProvider = async (provider) => {
  const client = new SESClient({
    region: provider.region,
    credentials: {
      accessKeyId: provider.accessKey,
      secretAccessKey: provider.secretKey,
    },
  });
  await client.send(new GetSendQuotaCommand({}));
};

const sendEmailViaProvider = async (provider, message) => {
  switch (provider.providerType) {
    case "smtp":
    case "gmail_smtp":
    case "custom_smtp":
      return await sendEmailViaSmtp(provider, message);
    case "sendgrid":
      return await sendEmailViaSendGrid(provider, message);
    case "resend":
      return await sendEmailViaResend(provider, message);
    case "mailgun":
      return await sendEmailViaMailgun(provider, message);
    case "aws_ses":
      return await sendEmailViaSes(provider, message);
    default:
      throw new Error(
        `Unsupported email provider type: ${provider.providerType}`,
      );
  }
};

const verifyEmailProviderConnection = async (provider) => {
  switch (provider.providerType) {
    case "smtp":
    case "gmail_smtp":
    case "custom_smtp":
      return await verifySmtpProvider(provider);
    case "sendgrid":
      return await axios.get("https://api.sendgrid.com/v3/user/account", {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
        },
      });
    case "resend":
      return await verifyResendProvider(provider);
    case "mailgun":
      return await verifyMailgunProvider(provider);
    case "aws_ses":
      return await verifySesProvider(provider);
    default:
      throw new Error(
        `Unsupported email provider type: ${provider.providerType}`,
      );
  }
};

const verifyTwilioProvider = async (provider) => {
  const client = twilio(provider.twilioAccountSid, provider.twilioAuthToken);
  await client.api.accounts(provider.twilioAccountSid).fetch();
};

const normalizePhoneNumber = (phone, defaultCountryCode = "91") => {
  if (!phone) return phone;

  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, "");

  // If already starts with +, return as-is
  if (normalized.startsWith("+")) {
    return normalized;
  }

  // If doesn't start with +, remove any leading zeros and add country code
  normalized = normalized.replace(/^0+/, "");

  // If the number is too short to be a full E.164 number, add country code
  if (!normalized.startsWith(defaultCountryCode) && normalized.length <= 10) {
    normalized = defaultCountryCode + normalized;
  }

  return "+" + normalized;
};

const sendPhoneViaTwilio = async (provider, phone, otp) => {
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log(`Twilio send: normalized ${phone} to ${normalizedPhone}`);

  const client = twilio(provider.twilioAccountSid, provider.twilioAuthToken);
  await client.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: provider.twilioPhoneNumber,
    to: normalizedPhone,
  });
};

const verifyMsg91Provider = async (provider) => {
  await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    {
      flow_id: provider.msg91TemplateId,
      sender: provider.msg91TemplateId,
      recipients: [
        {
          mobile: "919999999999",
          country: "91",
          params: { otp: "000000" },
        },
      ],
    },
    {
      headers: {
        authkey: provider.msg91AuthKey,
        "Content-Type": "application/json",
      },
    },
  );
};

const sendPhoneViaMsg91 = async (provider, phone, otp) => {
  // MSG91 expects mobile number without + but with country code (e.g., "919636376269")
  const cleanPhone = phone.replace(/[^\d]/g, "").replace(/^0+/, "");
  const msg91Phone = cleanPhone.length <= 10 ? "91" + cleanPhone : cleanPhone;

  console.log(`MSG91 send: normalized ${phone} to ${msg91Phone}`);

  await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    {
      flow_id: provider.msg91TemplateId,
      sender: provider.msg91TemplateId,
      recipients: [
        {
          mobile: msg91Phone,
          country: "91",
          params: { otp },
        },
      ],
    },
    {
      headers: {
        authkey: provider.msg91AuthKey,
        "Content-Type": "application/json",
      },
    },
  );
};

const verifyWhatsAppProvider = async (provider) => {
  if (!provider.whatsappAccessToken || !provider.whatsappPhoneNumberId) {
    throw new Error("WhatsApp provider credentials are required");
  }
  await axios.get(
    `https://graph.facebook.com/v22.0/${provider.whatsappPhoneNumberId}`,
    {
      headers: {
        Authorization: `Bearer ${provider.whatsappAccessToken}`,
      },
    },
  );
};

const sendPhoneViaWhatsApp = async (provider, phone, otp) => {
  const url = `https://graph.facebook.com/v22.0/${provider.whatsappPhoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "otp_verification",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${provider.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
};

const verifyVonageProvider = async (provider) => {
  await axios.get(
    `https://rest.nexmo.com/account/get-balance?api_key=${encodeURIComponent(
      provider.vonageApiKey,
    )}&api_secret=${encodeURIComponent(provider.vonageApiSecret)}`,
  );
};

const sendPhoneViaVonage = async (provider, phone, otp) => {
  const url = "https://rest.nexmo.com/sms/json";
  const data = new URLSearchParams();
  data.append("api_key", provider.vonageApiKey);
  data.append("api_secret", provider.vonageApiSecret);
  data.append("from", provider.vonageFromNumber);
  data.append("to", phone);
  data.append("text", `Your OTP code is: ${otp}`);
  await axios.post(url, data.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

const verifyCustomApiProvider = async (provider) => {
  if (!provider.customApiEndpoint?.trim()) {
    throw new Error("Custom API endpoint is required");
  }
  const headers = {
    "Content-Type": "application/json",
  };
  if (provider.customApiAuthKey?.trim()) {
    headers[provider.customApiAuthHeaderName || "Authorization"] =
      provider.customApiAuthKey;
  }
  await axios({
    method: provider.customApiMethod || "POST",
    url: provider.customApiEndpoint,
    headers,
    data: JSON.parse(provider.customApiPayloadTemplate || "{}"),
    timeout: 10000,
  });
};

const sendPhoneViaCustomApi = async (provider, phone, otp) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (provider.customApiAuthKey?.trim()) {
    headers[provider.customApiAuthHeaderName || "Authorization"] =
      provider.customApiAuthKey;
  }
  const payload = provider.customApiPayloadTemplate
    .replace(/\{\{\s*phone\s*\}\}/g, phone)
    .replace(/\{\{\s*otp\s*\}\}/g, otp);
  await axios({
    method: provider.customApiMethod || "POST",
    url: provider.customApiEndpoint,
    headers,
    data: payload ? JSON.parse(payload) : {},
    timeout: 10000,
  });
};

const sendPhoneViaProvider = async (provider, phone, otp) => {
  switch (provider.providerType) {
    case "twilio":
      return await sendPhoneViaTwilio(provider, phone, otp);
    case "msg91":
      return await sendPhoneViaMsg91(provider, phone, otp);
    case "whatsapp":
      return await sendPhoneViaWhatsApp(provider, phone, otp);
    case "vonage":
      return await sendPhoneViaVonage(provider, phone, otp);
    case "firebase":
      return await sendPhoneViaFirebase(provider, phone, otp);
    case "custom_api":
      return await sendPhoneViaCustomApi(provider, phone, otp);
    default:
      throw new Error(
        `Unsupported phone provider type for sending OTP: ${provider.providerType}`,
      );
  }
};

const verifyPhoneProviderConnection = async (provider) => {
  switch (provider.providerType) {
    case "twilio":
      return await verifyTwilioProvider(provider);
    case "msg91":
      return await verifyMsg91Provider(provider);
    case "whatsapp":
      return await verifyWhatsAppProvider(provider);
    case "vonage":
      return await verifyVonageProvider(provider);
    case "custom_api":
      return await verifyCustomApiProvider(provider);
    case "firebase":
      if (!provider.firebaseApiKey?.trim()) {
        throw new Error("Firebase API key is required");
      }
      if (
        !provider.firebaseConfig ||
        typeof provider.firebaseConfig !== "object"
      ) {
        throw new Error("Firebase config is required");
      }
      return await axios.get(
        `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(
          provider.firebaseConfig.projectId || "",
        )}?key=${encodeURIComponent(provider.firebaseApiKey)}`,
      );
    default:
      throw new Error(
        `Unsupported phone provider type: ${provider.providerType}`,
      );
  }
};

const maskProvider = (provider) =>
  provider?.providerType && provider.providerType.includes("otp")
    ? provider
    : provider;

export const getEmailProviders = async () => {
  const providers = await OtpEmailProvider.find({ isDeleted: false }).lean();
  return providers.map(createEmailProviderMask);
};

export const getPhoneProviders = async () => {
  const providers = await OtpPhoneProvider.find({ isDeleted: false }).lean();
  return providers.map(createPhoneProviderMask);
};

export const getEmailProviderById = async (id) => {
  const provider = await OtpEmailProvider.findOne({
    _id: id,
    isDeleted: false,
  }).select("+password +apiKey +accessKey +secretKey");
  return provider ? createEmailProviderMask(provider) : null;
};

export const getPhoneProviderById = async (id) => {
  const provider = await OtpPhoneProvider.findOne({
    _id: id,
    isDeleted: false,
  }).select(
    "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +firebaseRecaptchaToken +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
  );
  return provider ? createPhoneProviderMask(provider) : null;
};

export const createEmailProvider = async (payload) => {
  const normalizedPayload = applyEmailProviderDefaults(payload);
  validateEmailProviderPayload(normalizedPayload);
  if (normalizedPayload.isDefault) {
    await OtpEmailProvider.updateMany(
      { isDeleted: false },
      { isDefault: false },
    );
  }
  const provider = await OtpEmailProvider.create({
    ...normalizedPayload,
    status: normalizeProviderStatus(normalizedPayload.status),
  });
  return createEmailProviderMask(provider);
};

export const updateEmailProvider = async (providerId, payload) => {
  const existing = await OtpEmailProvider.findById(providerId)
    .select("+password +apiKey +accessKey +secretKey")
    .lean();
  if (!existing) throw new Error("Email provider not found");

  const merged = applyEmailProviderDefaults({
    ...existing,
    ...payload,
    ...buildProviderSecrets(payload, existing),
    status: payload.status
      ? normalizeProviderStatus(payload.status)
      : existing.status,
  });
  validateEmailProviderPayload(merged, { keepExistingPassword: true });

  if (merged.isDefault) {
    await OtpEmailProvider.updateMany(
      { isDeleted: false },
      { isDefault: false },
    );
  }

  const provider = await OtpEmailProvider.findByIdAndUpdate(
    providerId,
    merged,
    {
      new: true,
      runValidators: true,
    },
  ).select("+password +apiKey +accessKey +secretKey");
  return createEmailProviderMask(provider);
};

export const deleteEmailProvider = async (providerId) => {
  const provider = await OtpEmailProvider.findById(providerId);
  if (!provider || provider.isDeleted)
    throw new Error("Email provider not found");
  provider.isDeleted = true;
  provider.deletedAt = new Date();
  await provider.save();
  return true;
};

export const setDefaultEmailProvider = async (providerId) => {
  const provider = await OtpEmailProvider.findById(providerId);
  if (!provider || provider.isDeleted)
    throw new Error("Email provider not found");
  await OtpEmailProvider.updateMany({ isDeleted: false }, { isDefault: false });
  provider.isDefault = true;
  provider.status = "active";
  await provider.save();
  return createEmailProviderMask(provider);
};

export const testEmailProvider = async (providerId) => {
  const result = await OtpManager.testEmailProvider(providerId);
  if (!result.success) {
    throw new Error(result.message);
  }
  return result;
};

export const testPhoneProvider = async (providerId) => {
  const result = await OtpManager.testPhoneProvider(providerId);
  if (!result.success) {
    throw new Error(result.message);
  }
  return result;
};

export const createPhoneProvider = async (payload) => {
  validatePhoneProviderPayload(payload);
  if (payload.isDefault) {
    await OtpPhoneProvider.updateMany(
      { isDeleted: false },
      { isDefault: false },
    );
  }
  const provider = await OtpPhoneProvider.create({
    ...payload,
    status: normalizeProviderStatus(payload.status),
  });
  return createPhoneProviderMask(provider);
};

export const updatePhoneProvider = async (providerId, payload) => {
  const existing = await OtpPhoneProvider.findById(providerId)
    .select(
      "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
    )
    .lean();
  if (!existing) throw new Error("Phone provider not found");

  const merged = {
    ...existing,
    ...payload,
    ...buildProviderSecrets(payload, existing),
    status: payload.status
      ? normalizeProviderStatus(payload.status)
      : existing.status,
  };
  validatePhoneProviderPayload(merged, { keepExistingPassword: true });

  if (merged.isDefault) {
    await OtpPhoneProvider.updateMany(
      { isDeleted: false },
      { isDefault: false },
    );
  }

  const provider = await OtpPhoneProvider.findByIdAndUpdate(
    providerId,
    merged,
    {
      new: true,
      runValidators: true,
    },
  ).select(
    "+twilioAccountSid +twilioAuthToken +msg91AuthKey +firebaseApiKey +whatsappAccessToken +whatsappVerifyToken +vonageApiKey +vonageApiSecret +customApiAuthKey",
  );
  return createPhoneProviderMask(provider);
};

export const deletePhoneProvider = async (providerId) => {
  const provider = await OtpPhoneProvider.findById(providerId);
  if (!provider || provider.isDeleted)
    throw new Error("Phone provider not found");
  provider.isDeleted = true;
  provider.deletedAt = new Date();
  await provider.save();
  return true;
};

export const setDefaultPhoneProvider = async (providerId) => {
  const provider = await OtpPhoneProvider.findById(providerId);
  if (!provider || provider.isDeleted)
    throw new Error("Phone provider not found");
  await OtpPhoneProvider.updateMany({ isDeleted: false }, { isDefault: false });
  provider.isDefault = true;
  provider.status = "active";
  await provider.save();
  return createPhoneProviderMask(provider);
};

export const resolveEmailProvider = async () => {
  const provider = await getActiveEmailProvider();
  if (!provider) {
    return null;
  }
  return provider;
};

export const resolvePhoneProvider = async () => {
  const provider = await getActivePhoneProvider();
  if (!provider) {
    return null;
  }
  return provider;
};

export const sendEmailWithActiveProvider = async ({
  to,
  subject,
  html,
  text,
}) => {
  const provider = await resolveEmailProvider();
  if (!provider) {
    throw new Error("No active email provider configured");
  }
  return await sendEmailViaProvider(provider, { to, subject, html, text });
};

export const sendPhoneOtpWithActiveProvider = async (
  phone,
  otp,
  method = "sms",
  options = {},
) => {
  const provider = await resolvePhoneProviderForMethod(method);
  if (!provider) {
    throw new Error("No active phone provider configured");
  }
  // If caller provided a recaptcha token (from client), attach it for Firebase
  try {
    if (
      options &&
      options.recaptchaToken &&
      provider.providerType === "firebase"
    ) {
      provider.firebaseRecaptchaToken = options.recaptchaToken;
      console.log("Attached recaptcha token for firebase send (masked)");
    }
  } catch (e) {
    // no-op, proceed with existing provider config
  }
  return await sendPhoneViaProvider(provider, phone, otp);
};

export const testEmailProviderConnection = async (providerId) => {
  return await testEmailProvider(providerId);
};

export const testPhoneProviderConnection = async (providerId) => {
  return await testPhoneProvider(providerId);
};

export const createDefaultProviderIfNeeded = async () => {
  const emailCount = await OtpEmailProvider.countDocuments({
    isDeleted: false,
  });
  if (!emailCount) {
    return null;
  }
  return null;
};
