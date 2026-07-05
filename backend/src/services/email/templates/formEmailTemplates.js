const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripProtocol = (value = "") =>
  String(value).replace(/^https?:\/\//i, "");

const safeUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(mailto:|tel:|https?:\/\/|\/)/i.test(raw)) return raw;
  return `https://${raw}`;
};

const formatAnswerValue = (answer) => {
  if (!answer) return "";
  if (answer.fileUrl) {
    const fileLabel = escapeHtml(answer.fileName || answer.fileUrl);
    return `<a href="${escapeHtml(answer.fileUrl)}" target="_blank" rel="noreferrer" style="color:#16a34a;text-decoration:none;font-weight:700;">${fileLabel}</a>`;
  }
  if (Array.isArray(answer.value)) {
    return escapeHtml(answer.value.join(", "));
  }
  return escapeHtml(String(answer.value ?? ""));
};

const renderAnswerCards = (rows = []) =>
  rows
    .map(
      ({ question, answer }) => `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;background:#f8fafc;color:#0f172a;font-weight:700;width:34%;vertical-align:top;">${escapeHtml(question)}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#334155;vertical-align:top;">${answer}</td>
        </tr>`,
    )
    .join("");

const renderSocialLinks = (branding = {}) => {
  const socials = [
    { label: "Facebook", url: branding.facebookUrl },
    { label: "Instagram", url: branding.instagramUrl },
    { label: "LinkedIn", url: branding.linkedinUrl },
    { label: "YouTube", url: branding.youtubeUrl },
    { label: "WhatsApp", url: branding.whatsappUrl },
  ].filter((item) => item.url);

  if (!socials.length) return "";

  return `
    <div style="margin-top:18px;">
      ${socials
        .map(
          (item) => `
            <a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noreferrer" style="display:inline-block;margin:0 8px 8px 0;padding:10px 14px;border:1px solid #bbf7d0;border-radius:999px;color:#14532d;text-decoration:none;font-size:13px;font-weight:700;background:#f0fdf4;">${escapeHtml(item.label)}</a>`,
        )
        .join("")}
    </div>
  `;
};

const renderFooter = (branding = {}) => {
  const website = branding.brandWebsiteUrl || branding.websiteUrl || "";
  const contactEmail = branding.contactEmail || "";
  const contactPhone = branding.contactPhone || "";
  const contactAddress = branding.contactAddress || "";
  const footerText = branding.footerText || "";

  return `
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid #d1fae5;color:#475569;font-size:13px;line-height:1.6;">
      <div style="font-weight:700;color:#0f172a;margin-bottom:8px;">${escapeHtml(branding.companyName || "Technosthan AgriTech")}</div>
      ${website ? `<div>Website: <a href="${escapeHtml(safeUrl(website))}" style="color:#16a34a;text-decoration:none;">${escapeHtml(stripProtocol(website))}</a></div>` : ""}
      ${contactEmail ? `<div>Email: <a href="mailto:${escapeHtml(contactEmail)}" style="color:#16a34a;text-decoration:none;">${escapeHtml(contactEmail)}</a></div>` : ""}
      ${contactPhone ? `<div>Phone: <a href="tel:${escapeHtml(contactPhone)}" style="color:#16a34a;text-decoration:none;">${escapeHtml(contactPhone)}</a></div>` : ""}
      ${contactAddress ? `<div>Address: ${escapeHtml(contactAddress)}</div>` : ""}
      ${footerText ? `<div style="margin-top:10px;color:#64748b;">${escapeHtml(footerText)}</div>` : ""}
    </div>
  `;
};

const renderLogoBlock = (branding = {}) =>
  branding.logoUrl
    ? `<img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.companyName || "Technosthan AgriTech")}" style="display:block;height:52px;max-width:180px;object-fit:contain;" />`
    : `<div style="font-size:22px;line-height:1.2;font-weight:800;color:#ffffff;">${escapeHtml(branding.companyName || "Technosthan AgriTech")}</div>`;

const buildCommonShell = ({
  title,
  subtitle,
  branding = {},
  body,
  buttonLabel,
  buttonUrl,
  accent = "#16a34a",
}) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:760px;margin:0 auto;padding:24px 16px;">
      <div style="border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);background:#ffffff;">
        <div style="background:linear-gradient(135deg,#052e16,#16a34a 55%,#22c55e);padding:28px 28px 24px;color:#fff;">
          ${renderLogoBlock(branding)}
          <div style="margin-top:18px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.9;">${escapeHtml(branding.companyName || "Technosthan AgriTech")}</div>
          <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
          ${subtitle ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.6;opacity:0.95;">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <div style="padding:28px;">
          ${body}
          ${buttonUrl ? `<div style="margin-top:26px;"><a href="${escapeHtml(buttonUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;padding:14px 22px;border-radius:14px;font-weight:700;">${escapeHtml(buttonLabel || "Open")}</a></div>` : ""}
          ${renderFooter(branding)}
          ${renderSocialLinks(branding)}
        </div>
      </div>
    </div>
  </body>
</html>
`;

export const buildAdminFormSubmissionEmail = ({
  formTitle = "Form Submission",
  submittedAt = new Date().toISOString(),
  referenceId = "",
  rows = [],
  adminUrl = "",
  branding = {},
}) =>
  buildCommonShell({
    title: "New Form Submission",
    subtitle: `${formTitle} · ${referenceId}`,
    branding,
    body: `
      <div style="margin-bottom:18px;color:#475569;font-size:14px;line-height:1.7;">
        <div><strong style="color:#0f172a;">Form:</strong> ${escapeHtml(formTitle)}</div>
        <div><strong style="color:#0f172a;">Reference ID:</strong> ${escapeHtml(referenceId)}</div>
        <div><strong style="color:#0f172a;">Submitted at:</strong> ${escapeHtml(submittedAt)}</div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
        <tbody>
          ${renderAnswerCards(rows.map((row) => ({
            question: row.question,
            answer: row.answer,
          })))}
        </tbody>
      </table>
    `,
    buttonLabel: "Open Response in Admin Dashboard",
    buttonUrl: adminUrl,
  });

export const buildUserConfirmationEmail = ({
  formTitle = "Form Submission",
  submittedAt = new Date().toISOString(),
  referenceId = "",
  successMessage = "Thanks for your response.",
  rows = [],
  publicUrl = "",
  branding = {},
}) =>
  buildCommonShell({
    title: "Thank you for your submission",
    subtitle: formTitle,
    branding,
    body: `
      <div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:20px;padding:18px 20px;color:#14532d;margin-bottom:18px;">
        <div style="font-weight:700;margin-bottom:6px;">${escapeHtml(successMessage)}</div>
        <div style="font-size:14px;line-height:1.7;">
          <div><strong>Form:</strong> ${escapeHtml(formTitle)}</div>
          <div><strong>Reference ID:</strong> ${escapeHtml(referenceId)}</div>
          <div><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</div>
        </div>
      </div>
      ${rows.length ? `
        <div style="margin-bottom:12px;font-size:15px;font-weight:700;color:#0f172a;">Submission Summary</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
          <tbody>
            ${renderAnswerCards(rows.map((row) => ({
              question: row.question,
              answer: row.answer,
            })))}
          </tbody>
        </table>
      ` : ""}
    `,
    buttonLabel: "Visit Website",
    buttonUrl: publicUrl,
    accent: "#0f766e",
  });

export const formatSubmissionRows = (answers = []) =>
  answers.map((answer) => ({
    question: answer.question?.label || "Question",
    answer: formatAnswerValue(answer),
  }));

export default {
  buildAdminFormSubmissionEmail,
  buildUserConfirmationEmail,
  formatSubmissionRows,
};
