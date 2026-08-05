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

const resolvePublicImageUrl = (...candidates) => {
  for (const candidate of candidates.flat()) {
    const raw =
      candidate && typeof candidate === "object"
        ? candidate.secureUrl ||
          candidate.secure_url ||
          candidate.url ||
          candidate.fileUrl ||
          candidate.publicUrl ||
          ""
        : candidate;
    const value = String(raw || "").trim();
    if (!value) continue;

    try {
      const parsed = new URL(value);
      if (!["http:", "https:"].includes(parsed.protocol)) continue;
      const host = parsed.hostname.toLowerCase();
      if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
        continue;
      }
      return parsed.toString();
    } catch {
      continue;
    }
  }

  return "";
};

const normalizeHexColor = (value, fallback) => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw) ||
    /^rgba?\(/i.test(raw) ||
    /^hsla?\(/i.test(raw) ||
    /^var\(--[\w-]+\)$/i.test(raw)
  ) {
    return raw;
  }
  return fallback;
};

const normalizeBorderRadius = (value, fallback = 24) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isLightColor = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/^#([0-9a-f]{6})$/i);
  if (!match) return false;
  const hex = match[1];
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 160;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const replaceTokens = (value = "", context = {}) => {
  const escaped = escapeHtml(value);
  return escaped.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, token) => {
    if (token === "responsesTable") {
      return context.responsesTable || "";
    }

    const replacement = context[token];
    return escapeHtml(replacement ?? "");
  });
};

const formatAnswerValue = (answer) => {
  if (!answer) return "";
  if (answer.fileUrl) {
    const fileLabel = escapeHtml(answer.fileName || answer.fileUrl);
    return `<a href="${escapeHtml(answer.fileUrl)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;font-weight:700;">${fileLabel}</a>`;
  }
  if (Array.isArray(answer.value)) {
    return escapeHtml(answer.value.join(", "));
  }
  return escapeHtml(String(answer.value ?? ""));
};

const renderResponsesTable = (rows = [], styles = {}) => {
  if (!rows.length) return "";
  const border = styles.borderColor || "rgba(148,163,184,0.24)";
  const accent = styles.accentColor || "#16a34a";
  const textColor = styles.textColor || "#0f172a";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${border};border-radius:${styles.borderRadius || 24}px;overflow:hidden;background:${styles.cardBackgroundColor || "#ffffff"};">
      <tbody>
        ${rows
          .map(
            ({ question, answer }) => `
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid ${border};background:rgba(0,0,0,0.02);color:${textColor};font-weight:700;width:34%;vertical-align:top;">${escapeHtml(question)}</td>
                <td style="padding:14px 16px;border-bottom:1px solid ${border};color:${textColor};vertical-align:top;line-height:1.65;">
                  <span style="display:inline-block;border-left:3px solid ${accent};padding-left:12px;">${answer}</span>
                </td>
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const renderLogo = (branding = {}, styles = {}) => {
  const companyName = branding.companyName || styles.companyName || "Form Submission";
  const headerTextColor = styles.headerTextColor || "#ffffff";
  const logoUrl = resolvePublicImageUrl(branding.logoAsset, branding.logoUrl);
  if (logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)} logo" style="display:block;height:54px;max-width:180px;object-fit:contain;" />`;
  }
  return `<div style="font-size:22px;line-height:1.2;font-weight:800;color:${headerTextColor};">${escapeHtml(companyName)}</div>`;
};

const buildEmailShell = ({
  headerTitle,
  headerSubtitle,
  successMessage,
  footerText,
  buttonLabel,
  buttonUrl,
  branding = {},
  rows = [],
  submittedAt = "",
  referenceId = "",
  includeReferenceId = false,
  styles = {},
  bodyContent = "",
}) => {
  const headerBackgroundColor = normalizeHexColor(
    styles.headerBackgroundColor,
    "#16a34a",
  );
  const bodyBackgroundColor = normalizeHexColor(
    styles.bodyBackgroundColor,
    "#f3f4f6",
  );
  const cardBackgroundColor = normalizeHexColor(
    styles.cardBackgroundColor,
    "#ffffff",
  );
  const accentColor = normalizeHexColor(styles.accentColor, "#16a34a");
  const textColor = normalizeHexColor(styles.textColor, "#0f172a");
  const buttonColor = normalizeHexColor(styles.buttonColor, accentColor);
  const borderRadius = normalizeBorderRadius(styles.borderRadius, 24);
  const headerTextColor =
    styles.headerTextColor ||
    (isLightColor(headerBackgroundColor) ? "#0f172a" : "#ffffff");
  const responsesTable = renderResponsesTable(rows, {
    cardBackgroundColor,
    accentColor,
    textColor,
    borderRadius,
  });

  const context = {
    formName: branding.formName || "",
    submissionDate: submittedAt,
    userName: branding.userName || "",
    userEmail: branding.userEmail || "",
    responsesTable,
    companyName: branding.companyName || "",
    referenceId,
  };

  const resolvedHeaderTitle = replaceTokens(headerTitle, context) || "";
  const resolvedHeaderSubtitle = replaceTokens(headerSubtitle, context) || "";
  const resolvedSuccessMessage = replaceTokens(successMessage, context) || "";
  const resolvedFooterText = replaceTokens(footerText, context) || "";
  const resolvedButtonLabel = replaceTokens(buttonLabel, context) || "";
  const resolvedButtonUrl = safeUrl(replaceTokens(buttonUrl, context));

  return `<!DOCTYPE html>
  <html>
    <body style="margin:0;background:${bodyBackgroundColor};font-family:Arial,Helvetica,sans-serif;color:${textColor};">
      <div style="max-width:760px;margin:0 auto;padding:24px 16px;">
        <div style="border-radius:${borderRadius + 8}px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);background:${cardBackgroundColor};">
          <div style="background:${headerBackgroundColor};padding:28px;color:${headerTextColor};">
            ${renderLogo(branding, { companyName: branding.companyName, headerTextColor })}
            <div style="margin-top:18px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">${escapeHtml(branding.companyName || "Form Builder")}</div>
            <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;color:${headerTextColor};">${resolvedHeaderTitle || "Form Submission"}</h1>
            ${resolvedHeaderSubtitle ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.6;opacity:0.95;color:${headerTextColor};">${resolvedHeaderSubtitle}</p>` : ""}
          </div>

          ${resolvePublicImageUrl(branding.bannerImageAsset, branding.bannerImageUrl) ? `
            <div style="padding:20px 24px 0;">
              <img src="${escapeHtml(resolvePublicImageUrl(branding.bannerImageAsset, branding.bannerImageUrl))}" alt="${escapeHtml(branding.companyName || "Banner")} banner" style="display:block;width:100%;max-height:220px;object-fit:cover;border-radius:${borderRadius}px;" />
            </div>
          ` : ""}

          <div style="padding:28px;">
            ${successMessage ? `
              <div style="background:${bodyBackgroundColor};border:1px solid ${accentColor};border-radius:${borderRadius}px;padding:18px 20px;color:${textColor};margin-bottom:18px;line-height:1.65;">
                <div style="font-weight:800;margin-bottom:6px;">${resolvedSuccessMessage}</div>
                ${submittedAt ? `<div><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</div>` : ""}
                ${includeReferenceId && referenceId ? `<div><strong>Reference ID:</strong> ${escapeHtml(referenceId)}</div>` : ""}
              </div>
            ` : ""}

            ${bodyContent}

            ${resolvedButtonUrl ? `
              <div style="margin-top:26px;">
                <a href="${escapeHtml(resolvedButtonUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;background:${buttonColor};color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:${Math.max(12, Math.min(borderRadius, 32))}px;font-weight:700;">${resolvedButtonLabel || "Open"}</a>
              </div>
            ` : ""}

            ${footerText || branding.footerText ? `
              <div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(148,163,184,0.28);color:${textColor};font-size:13px;line-height:1.7;opacity:0.9;">
                <div style="font-weight:700;margin-bottom:8px;">${escapeHtml(branding.companyName || "Form Builder")}</div>
                ${resolvedFooterText ? `<div>${resolvedFooterText}</div>` : ""}
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const buildAdminFormSubmissionEmail = ({
  formTitle = "Form Submission",
  submittedAt = new Date().toISOString(),
  referenceId = "",
  rows = [],
  adminUrl = "",
  branding = {},
  emailTemplate = {},
}) => {
  const resolvedBranding = {
    ...branding,
    formName: formTitle,
    companyName: emailTemplate.companyName || branding.companyName || "TechnoSthan",
    logoUrl: resolvePublicImageUrl(
      emailTemplate.logoAsset,
      emailTemplate.logoUrl,
      branding.logoAsset,
      branding.logoUrl,
    ),
    bannerImageUrl: resolvePublicImageUrl(
      emailTemplate.bannerImageAsset,
      emailTemplate.bannerImageUrl,
      branding.bannerImageAsset,
      branding.bannerImageUrl,
    ),
  };

  return buildEmailShell({
    headerTitle: emailTemplate.headerTitle || "New Form Submission",
    headerSubtitle:
      emailTemplate.headerSubtitle || "{{formName}} - {{submissionDate}}",
    successMessage: "",
    footerText: emailTemplate.footerText || "",
    buttonLabel: emailTemplate.websiteButtonText || "Open Response in Admin Dashboard",
    buttonUrl: adminUrl,
    branding: resolvedBranding,
    rows,
    submittedAt: submittedAt ? formatDateTime(submittedAt) : "",
    referenceId,
    includeReferenceId: true,
    styles: {
      ...emailTemplate,
      companyName: resolvedBranding.companyName,
    },
    bodyContent: `
      <div style="margin-bottom:18px;color:${normalizeHexColor(emailTemplate.textColor, "#0f172a")};font-size:14px;line-height:1.7;">
        <div><strong>Form:</strong> ${escapeHtml(formTitle)}</div>
        <div><strong>Reference ID:</strong> ${escapeHtml(referenceId)}</div>
        <div><strong>Submitted at:</strong> ${escapeHtml(formatDateTime(submittedAt))}</div>
      </div>
      ${rows.length ? `<div style="margin-bottom:12px;font-size:15px;font-weight:700;color:${normalizeHexColor(emailTemplate.textColor, "#0f172a")};">Submission Summary</div>${renderResponsesTable(rows, {
        cardBackgroundColor: normalizeHexColor(emailTemplate.cardBackgroundColor, "#ffffff"),
        accentColor: normalizeHexColor(emailTemplate.accentColor, "#16a34a"),
        textColor: normalizeHexColor(emailTemplate.textColor, "#0f172a"),
        borderRadius: normalizeBorderRadius(emailTemplate.borderRadius, 24),
      })}` : ""}
    `,
  });
};

export const buildUserConfirmationEmail = ({
  formTitle = "Form Submission",
  submittedAt = new Date().toISOString(),
  successMessage = "Thanks for your response.",
  rows = [],
  publicUrl = "",
  branding = {},
  emailTemplate = {},
}) => {
  const resolvedBranding = {
    ...branding,
    formName: formTitle,
    companyName: emailTemplate.companyName || branding.companyName || "TechnoSthan",
    logoUrl: resolvePublicImageUrl(
      emailTemplate.logoAsset,
      emailTemplate.logoUrl,
      branding.logoAsset,
      branding.logoUrl,
    ),
    bannerImageUrl: resolvePublicImageUrl(
      emailTemplate.bannerImageAsset,
      emailTemplate.bannerImageUrl,
      branding.bannerImageAsset,
      branding.bannerImageUrl,
    ),
  };

  const fallbackButtonUrl =
    emailTemplate.websiteButtonUrl ||
    publicUrl ||
    branding.brandWebsiteUrl ||
    "";

  return buildEmailShell({
    headerTitle: emailTemplate.headerTitle || "Thank you for your submission",
    headerSubtitle: emailTemplate.headerSubtitle || "{{formName}}",
    successMessage: emailTemplate.successMessage || successMessage,
    footerText: emailTemplate.footerText || "",
    buttonLabel: emailTemplate.websiteButtonText || "Visit Website",
    buttonUrl: fallbackButtonUrl,
    branding: resolvedBranding,
    rows,
    submittedAt: submittedAt ? formatDateTime(submittedAt) : "",
    includeReferenceId: false,
    styles: {
      ...emailTemplate,
      companyName: resolvedBranding.companyName,
    },
    bodyContent: rows.length
      ? `
        <div style="margin-bottom:12px;font-size:15px;font-weight:700;color:${normalizeHexColor(emailTemplate.textColor, "#0f172a")};">Submission Summary</div>
        ${renderResponsesTable(rows, {
          cardBackgroundColor: normalizeHexColor(emailTemplate.cardBackgroundColor, "#ffffff"),
          accentColor: normalizeHexColor(emailTemplate.accentColor, "#16a34a"),
          textColor: normalizeHexColor(emailTemplate.textColor, "#0f172a"),
          borderRadius: normalizeBorderRadius(emailTemplate.borderRadius, 24),
        })}
      `
      : "",
  });
};

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
