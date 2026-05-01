const nodemailer  = require('nodemailer');
const EmailConfig = require('../models/EmailConfig');

const getTransporter = async () => {
  const config = await EmailConfig.findOne().sort({ updatedAt: -1 });
  if (!config) throw new Error('Email config not set. Admin must configure SMTP first.');

  console.log('Using SMTP config:', config.emailUser);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.emailUser, pass: config.emailPass },
  });

  // Verify SMTP connection before sending
  await transporter.verify();
  console.log('SMTP connection verified OK');

  return { transporter, config };
};

const renderTemplate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');

const buildHTML = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:28px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Message from Our Team</h1>
    </div>
    <div style="padding:28px;background:#fff;font-size:15px;color:#333;line-height:1.7;">
      ${body.replace(/\n/g, '<br/>')}
    </div>
    <div style="background:#f5f5f5;padding:14px;text-align:center;font-size:12px;color:#999;">
      You received this email from our platform.
    </div>
  </div>`;

const sendEmailsInBatches = async (contacts, batchSize = 10, delayMs = 2000, onProgress) => {
  console.log(`Starting email batch send for ${contacts.length} contacts`);

  let transporter, config;
  try {
    const result = await getTransporter();
    transporter = result.transporter;
    config = result.config;
  } catch (err) {
    console.error('SMTP setup failed:', err.message);
    for (const contact of contacts) {
      if (onProgress) await onProgress(contact._id, 'failed', err.message);
    }
    return;
  }

  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    console.log(`Sending batch ${Math.floor(i / batchSize) + 1} — ${batch.length} emails`);

    await Promise.all(batch.map(async (contact) => {
      try {
        const body = renderTemplate(config.bodyTemplate, { email: contact.email, phone: contact.phone });
        await transporter.sendMail({
          from: `"Our Team" <${config.emailUser}>`,
          to: contact.email,
          subject: config.subject,
          html: buildHTML(body),
        });
        console.log(`Sent OK → ${contact.email}`);
        if (onProgress) await onProgress(contact._id, 'sent', '');
      } catch (err) {
        console.error(`Failed → ${contact.email}: ${err.message}`);
        if (onProgress) await onProgress(contact._id, 'failed', err.message);
      }
    }));

    if (i + batchSize < contacts.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log('Batch send complete');
};

module.exports = { sendEmailsInBatches };
