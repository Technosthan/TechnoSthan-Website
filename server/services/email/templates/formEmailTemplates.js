const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeHttpUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(javascript:|data:|file:)/i.test(raw)) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.href;
  } catch {
    return "";
  }
};

const safeUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return normalizeHttpUrl(raw);
};

const normalizeFooterButtons = (buttons = [], legacyButtons = []) =>
  (Array.isArray(buttons) ? buttons : [])
    .concat(Array.isArray(legacyButtons) ? legacyButtons : [])
    .map((button, index) => ({
      id: String(button?.id || `footer-button-${index}`),
      text: String(button?.text || button?.label || "").trim(),
      url: normalizeHttpUrl(button?.url || ""),
      order: typeof button?.order === "number" ? button.order : index,
    }))
    .filter((button) => button.text && button.url)
    .sort((a, b) => a.order - b.order);

const renderFooterButtons = (buttons = [], styles = {}) => {
  const resolvedButtons = normalizeFooterButtons(buttons);
  if (!resolvedButtons.length) return "";

  const buttonColor = normalizeHexColor(styles.buttonColor, styles.accentColor || "#0ea5e9");
  const buttonTextColor = styles.buttonTextColor || "#ffffff";
  const radius = Math.max(12, Math.min(normalizeBorderRadius(styles.borderRadius, 24), 22));

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:26px;border-collapse:separate;border-spacing:0;">
      <tbody>
        ${resolvedButtons
          .map(
            (button) => `
              <tr>
                <td style="padding:0 0 12px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                    <tbody>
                      <tr>
                        <td align="center" bgcolor="${buttonColor}" style="border-radius:${radius}px;">
                          <a href="${escapeHtml(button.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 22px;font-size:14px;line-height:1.2;font-weight:700;color:${buttonTextColor};text-decoration:none;border-radius:${radius}px;mso-padding-alt:0;">
                            ${escapeHtml(button.text)}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
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
    /^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(raw) ||
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
  const match = raw.match(/^#([a-f0-9]{6})$/i);
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

const replaceTokens = (value = "", context = {}) =>
  String(value || "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, token) => {
    if (token === "responsesTable") {
      return context.responsesTable || "";
    }
    const replacement = context[token];
    return escapeHtml(replacement ?? "");
  });

const getSubmissionRowLabel = (answer) => {
  if (!answer) return "Question";
  return answer.fieldLabel || answer.question?.label || "Question";
};

const getSubmissionRowContext = (answer) => {
  if (!answer) return "";
  const breadcrumb = String(answer.displayContext || answer.conditionalMeta?.breadcrumb || "").trim();
  if (breadcrumb) return breadcrumb;

  const pieces = [];
  const mainLabel = String(answer.question?.label || "").trim();
  const parentLabel = String(answer.parentOptionLabel || "").trim();
  const fieldLabel = String(answer.fieldLabel || "").trim();
  if (mainLabel) pieces.push(mainLabel);
  if (parentLabel) pieces.push(parentLabel);
  if (fieldLabel && fieldLabel !== mainLabel) pieces.push(fieldLabel);
  return pieces.join(" → ");
};

const formatAnswerValue = (answer) => {
  if (!answer) return "";
  if (Array.isArray(answer.fileUrls) && answer.fileUrls.length > 1) {
    const fileNames = Array.isArray(answer.fileNames) ? answer.fileNames : [];
    return `
      <div style="display:block;">
        ${answer.fileUrls
          .map((url, index) => {
            const fileName = escapeHtml(fileNames[index] || `File ${index + 1}`);
            const isImage = /^image\//i.test(String(answer.fileType || ""));
            return isImage
              ? `<div style="margin-bottom:12px;"><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="display:inline-block;text-decoration:none;"><img src="${escapeHtml(url)}" alt="${fileName}" style="display:block;max-width:100%;height:auto;border-radius:12px;" /></a><div style="margin-top:8px;"><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;font-weight:700;">${fileName}</a></div></div>`
              : `<div style="margin-bottom:8px;"><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;font-weight:700;">${fileName}</a></div>`;
          })
          .join("")}
      </div>`;
  }
  if (answer.fileUrl) {
    const fileLabel = escapeHtml(answer.fileName || answer.fileUrl);
    if (/^image\//i.test(String(answer.fileType || "")) || (answer.fieldType || answer.question?.type) === "imageUpload") {
      return `
        <div style="display:block;">
          <a href="${escapeHtml(answer.fileUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;text-decoration:none;">
            <img src="${escapeHtml(answer.fileUrl)}" alt="${fileLabel}" style="display:block;max-width:100%;height:auto;border-radius:12px;" />
          </a>
          <div style="margin-top:8px;">
            <a href="${escapeHtml(answer.fileUrl)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;font-weight:700;">${fileLabel}</a>
          </div>
        </div>`;
    }
    return `<a href="${escapeHtml(answer.fileUrl)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none;font-weight:700;">${fileLabel}</a>`;
  }
  if ((answer.fieldType || answer.question?.type) === "password") {
    return `<span style="letter-spacing:0.18em;font-weight:800;">••••••••••••</span>`;
  }
  if ((answer.fieldType || answer.question?.type) === "link") {
    const href = normalizeHttpUrl(answer.value);
    const label = escapeHtml(String(answer.value || ""));
    return href
      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color:#0891b2;text-decoration:underline;word-break:break-word;overflow-wrap:anywhere;">${label}</a>`
      : escapeHtml(String(answer.value ?? ""));
  }
  if (Array.isArray(answer.value)) {
    return `
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${answer.value
          .map((item) => `<div style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;top:0;">•</span><span>${escapeHtml(item)}</span></div>`)
          .join("")}
      </div>`;
  }
  return escapeHtml(String(answer.value ?? ""));
};

const renderResponsesTable = (rows = [], styles = {}) => {
  if (!rows.length) return "";
  const border = styles.borderColor || "rgba(148,163,184,0.24)";
  const accent = styles.accentColor || "#0ea5e9";
  const textColor = styles.textColor || "#0f172a";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${border};border-radius:${styles.borderRadius || 24}px;overflow:hidden;background:${styles.cardBackgroundColor || "#ffffff"};">
      <tbody>
        ${rows
          .map(
            (row) => row.kind === "section"
              ? `
              <tr>
                <td colspan="2" style="padding:16px 16px 10px;background:${styles.cardBackgroundColor || "#ffffff"};color:${accent};font-weight:800;text-transform:uppercase;letter-spacing:0.14em;font-size:11px;border-top:1px solid ${border};">
                  ${escapeHtml(row.label)}
                </td>
              </tr>`
              : `
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid ${border};background:rgba(0,0,0,0.02);color:${textColor};font-weight:700;width:34%;vertical-align:top;">
                  <div>${escapeHtml(row.question)}</div>
                  ${row.context ? `<div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.04em;color:${accent};opacity:0.85;">${escapeHtml(row.context)}</div>` : ""}
                </td>
                <td style="padding:14px 16px;border-bottom:1px solid ${border};color:${textColor};vertical-align:top;line-height:1.65;">
                  <span style="display:inline-block;border-left:3px solid ${accent};padding-left:12px;">${row.answer}</span>
                </td>
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const normalizeHeaderAlignment = (value = "left") =>
  ["left", "center", "right"].includes(String(value || "").trim())
    ? String(value).trim()
    : "left";

const normalizeHeaderPosition = (value = "center") =>
  ["center", "top", "bottom", "left", "right"].includes(String(value || "").trim())
    ? String(value).trim()
    : "center";

const normalizeHeaderSize = (value = "cover") =>
  ["cover", "contain", "auto"].includes(String(value || "").trim())
    ? String(value).trim()
    : "cover";

const normalizeHeaderMinHeight = (value = 220) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 220;
};

const normalizeHeaderOpacity = (value = 0.45) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.45;
  return Math.min(1, Math.max(0, parsed));
};

const hexToRgb = (value = "") => {
  const match = String(value || "").trim().match(/^#([a-f0-9]{6})$/i);
  if (!match) return null;
  return {
    r: Number.parseInt(match[1].slice(0, 2), 16),
    g: Number.parseInt(match[1].slice(2, 4), 16),
    b: Number.parseInt(match[1].slice(4, 6), 16),
  };
};

const rgbaFromHex = (value, opacity = 0.45) => {
  const rgb = hexToRgb(value);
  if (!rgb) {
    return `rgba(0,0,0,${opacity})`;
  }
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
};

const resolveHeaderTheme = (styles = {}) => {
  const headerBackgroundColor = normalizeHexColor(styles.headerBackgroundColor, "#0f172a");
  const headerBackgroundImageUrl = resolvePublicImageUrl(
    styles.headerBackgroundImageAsset,
    styles.headerBackgroundImageUrl,
    styles.headerBackgroundImage,
  );
  const headerBackgroundType =
    String(styles.headerBackgroundType || "").trim() === "image" && headerBackgroundImageUrl
      ? "image"
      : "color";
  const headerOverlayColor = normalizeHexColor(styles.headerOverlayColor, "#000000");
  const headerOverlayOpacity = normalizeHeaderOpacity(styles.headerOverlayOpacity);
  const headerMinHeight = normalizeHeaderMinHeight(styles.headerMinHeight);
  const headerTextAlign = normalizeHeaderAlignment(styles.headerTextAlign);
  const headerBackgroundPosition = normalizeHeaderPosition(styles.headerBackgroundPosition);
  const headerBackgroundSize = normalizeHeaderSize(styles.headerBackgroundSize);
  const headerTextColor =
    styles.headerTextColor || (isLightColor(headerBackgroundColor) ? "#0f172a" : "#ffffff");
  return {
    headerBackgroundColor,
    headerBackgroundType,
    headerBackgroundImageUrl,
    headerOverlayColor,
    headerOverlayOpacity,
    headerMinHeight,
    headerTextAlign,
    headerBackgroundPosition,
    headerBackgroundSize,
    headerTextColor,
  };
};

const renderLogo = (branding = {}, styles = {}) => {
  const companyName = branding.companyName || styles.companyName || "Form Submission";
  const headerTextColor = styles.headerTextColor || "#ffffff";
  const logoUrl = resolvePublicImageUrl(branding.logoAsset, branding.logoUrl);
  if (logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)} logo" style="display:block;max-width:180px;max-height:54px;width:auto;height:auto;object-fit:contain;" />`;
  }
  return `<div style="font-size:22px;line-height:1.2;font-weight:800;color:${headerTextColor};">${escapeHtml(companyName)}</div>`;
};

const renderHeaderContent = ({
  branding = {},
  headerTitle = "",
  headerSubtitle = "",
  headerTextColor = "#ffffff",
  headerTextAlign = "left",
  headerOverlayColor = "#000000",
  headerOverlayOpacity = 0.45,
}) => `
  <div style="background:${rgbaFromHex(headerOverlayColor, headerOverlayOpacity)};padding:28px;text-align:${headerTextAlign};color:${headerTextColor};">
    <div style="text-align:${headerTextAlign};">${renderLogo(branding, { companyName: branding.companyName, headerTextColor })}</div>
    <div style="margin-top:18px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">${escapeHtml(branding.companyName || "Form Builder")}</div>
    <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;color:${headerTextColor};">${headerTitle || "Form Submission"}</h1>
    ${headerSubtitle ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.6;opacity:0.95;color:${headerTextColor};">${headerSubtitle}</p>` : ""}
  </div>
`;

const renderHeaderSection = ({
  branding = {},
  headerTitle = "",
  headerSubtitle = "",
  styles = {},
}) => {
  const headerTheme = resolveHeaderTheme(styles);
  const overlayColor = rgbaFromHex(
    headerTheme.headerOverlayColor,
    headerTheme.headerOverlayOpacity,
  );
  const overlayContent = renderHeaderContent({
    branding,
    headerTitle,
    headerSubtitle,
    headerTextColor: headerTheme.headerTextColor,
    headerTextAlign: headerTheme.headerTextAlign,
    headerOverlayColor: headerTheme.headerOverlayColor,
    headerOverlayOpacity: headerTheme.headerOverlayOpacity,
  });
  const headerCellStyle = [
    `background-color:${headerTheme.headerBackgroundColor}`,
    headerTheme.headerBackgroundType === "image" && headerTheme.headerBackgroundImageUrl
      ? `background-image:url('${escapeHtml(headerTheme.headerBackgroundImageUrl)}')`
      : "",
    headerTheme.headerBackgroundType === "image" && headerTheme.headerBackgroundImageUrl
      ? `background-repeat:no-repeat`
      : "",
    headerTheme.headerBackgroundType === "image" && headerTheme.headerBackgroundImageUrl
      ? `background-position:${headerTheme.headerBackgroundPosition}`
      : "",
    headerTheme.headerBackgroundType === "image" && headerTheme.headerBackgroundImageUrl
      ? `background-size:${headerTheme.headerBackgroundSize}`
      : "",
  ]
    .filter(Boolean)
    .join(";");

  if (headerTheme.headerBackgroundType === "image" && headerTheme.headerBackgroundImageUrl) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td
            width="760"
            height="${headerTheme.headerMinHeight}"
            background="${escapeHtml(headerTheme.headerBackgroundImageUrl)}"
            bgcolor="${escapeHtml(headerTheme.headerBackgroundColor)}"
            valign="top"
            style="${headerCellStyle};height:${headerTheme.headerMinHeight}px;min-height:${headerTheme.headerMinHeight}px;">
            <!--[if gte mso 9]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:760px;height:${headerTheme.headerMinHeight}px;">
              <v:fill type="frame" src="${escapeHtml(headerTheme.headerBackgroundImageUrl)}" color="${escapeHtml(headerTheme.headerBackgroundColor)}" />
              <v:textbox inset="0,0,0,0">
            <![endif]-->
            <div style="background:${overlayColor};min-height:${headerTheme.headerMinHeight}px;height:${headerTheme.headerMinHeight}px;">
              ${overlayContent}
            </div>
            <!--[if gte mso 9]>
              </v:textbox>
            </v:rect>
            <![endif]-->
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <div style="background:${headerTheme.headerBackgroundColor};min-height:${headerTheme.headerMinHeight}px;">
      ${overlayContent}
    </div>
  `;
};

const buildEmailShell = ({
  headerTitle,
  headerSubtitle,
  successMessage,
  footerText,
  buttonLabel,
  buttonUrl,
  footerButtons = [],
  branding = {},
  rows = [],
  submittedAt = "",
  referenceId = "",
  includeReferenceId = false,
  styles = {},
  bodyContent = "",
}) => {
  const headerTheme = resolveHeaderTheme(styles);
  const bodyBackgroundColor = normalizeHexColor(styles.bodyBackgroundColor, "#f3f4f6");
  const cardBackgroundColor = normalizeHexColor(styles.cardBackgroundColor, "#ffffff");
  const accentColor = normalizeHexColor(styles.accentColor, "#0ea5e9");
  const textColor = normalizeHexColor(styles.textColor, "#0f172a");
  const buttonColor = normalizeHexColor(styles.buttonColor, accentColor);
  const borderRadius = normalizeBorderRadius(styles.borderRadius, 24);
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
  const resolvedFooterButtons = normalizeFooterButtons(footerButtons);

  return `<!DOCTYPE html>
  <html>
    <body style="margin:0;background:${bodyBackgroundColor};font-family:Arial,Helvetica,sans-serif;color:${textColor};">
      <div style="max-width:760px;margin:0 auto;padding:24px 16px;">
        <div style="border-radius:${borderRadius + 8}px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);background:${cardBackgroundColor};">
          ${renderHeaderSection({
            branding,
            headerTitle: resolvedHeaderTitle,
            headerSubtitle: resolvedHeaderSubtitle,
            styles: {
              ...styles,
              ...headerTheme,
            },
          })}

          ${resolvePublicImageUrl(branding.bannerImageAsset, branding.bannerImageUrl, branding.bannerUrl) ? `
            <div style="padding:20px 24px 0;">
              <img src="${escapeHtml(resolvePublicImageUrl(branding.bannerImageAsset, branding.bannerImageUrl, branding.bannerUrl))}" alt="${escapeHtml(branding.companyName || "Banner")} banner" style="display:block;width:100%;height:auto;max-width:100%;object-fit:contain;border-radius:${borderRadius}px;" />
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

            ${resolvedFooterButtons.length ? renderFooterButtons(resolvedFooterButtons, {
              buttonColor,
              borderRadius,
              accentColor,
            }) : resolvedButtonUrl ? `
              <div style="margin-top:26px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                  <tbody>
                    <tr>
                      <td align="center" bgcolor="${buttonColor}" style="border-radius:${Math.max(12, Math.min(borderRadius, 32))}px;">
                        <a href="${escapeHtml(resolvedButtonUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 22px;font-size:14px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;border-radius:${Math.max(12, Math.min(borderRadius, 32))}px;mso-padding-alt:0;">${resolvedButtonLabel || "Open"}</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
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

const buildAdminFormSubmissionEmail = ({
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
    bannerUrl: resolvePublicImageUrl(
      emailTemplate.bannerImageAsset,
      emailTemplate.bannerImageUrl,
      emailTemplate.bannerUrl,
      branding.bannerImageAsset,
      branding.bannerImageUrl,
      branding.bannerUrl,
    ),
  };

  const footerButtons = normalizeFooterButtons(
    emailTemplate.footerButtons,
    emailTemplate.websiteButtonText && emailTemplate.websiteButtonUrl
      ? [
          {
            id: "legacy-website-button",
            text: emailTemplate.websiteButtonText,
            url: emailTemplate.websiteButtonUrl,
            order: 0,
          },
        ]
      : [],
  );

  return buildEmailShell({
    headerTitle: emailTemplate.headerTitle || "New Form Submission",
    headerSubtitle: emailTemplate.headerSubtitle || "{{formName}} - {{submissionDate}}",
    successMessage: "",
    footerText: emailTemplate.footerText || "",
    buttonLabel: emailTemplate.websiteButtonText || "Open Response in Admin Dashboard",
    buttonUrl: adminUrl,
    footerButtons,
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
        accentColor: normalizeHexColor(emailTemplate.accentColor, "#0ea5e9"),
        textColor: normalizeHexColor(emailTemplate.textColor, "#0f172a"),
        borderRadius: normalizeBorderRadius(emailTemplate.borderRadius, 24),
      })}` : ""}
    `,
  });
};

const buildUserConfirmationEmail = ({
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
    bannerUrl: resolvePublicImageUrl(
      emailTemplate.bannerImageAsset,
      emailTemplate.bannerImageUrl,
      emailTemplate.bannerUrl,
      branding.bannerImageAsset,
      branding.bannerImageUrl,
      branding.bannerUrl,
    ),
  };

  const fallbackButtonUrl =
    emailTemplate.websiteButtonUrl ||
    publicUrl ||
    branding.brandWebsiteUrl ||
    "";

  const footerButtons = normalizeFooterButtons(
    emailTemplate.footerButtons,
    emailTemplate.websiteButtonText && emailTemplate.websiteButtonUrl
      ? [
          {
            id: "legacy-website-button",
            text: emailTemplate.websiteButtonText,
            url: emailTemplate.websiteButtonUrl,
            order: 0,
          },
        ]
      : [],
  );

  return buildEmailShell({
    headerTitle: emailTemplate.headerTitle || "Thank you for your submission",
    headerSubtitle: emailTemplate.headerSubtitle || "{{formName}}",
    successMessage: emailTemplate.successMessage || successMessage,
    footerText: emailTemplate.footerText || "",
    buttonLabel: emailTemplate.websiteButtonText || "Visit Website",
    buttonUrl: fallbackButtonUrl,
    footerButtons,
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
          accentColor: normalizeHexColor(emailTemplate.accentColor, "#0ea5e9"),
          textColor: normalizeHexColor(emailTemplate.textColor, "#0f172a"),
          borderRadius: normalizeBorderRadius(emailTemplate.borderRadius, 24),
        })}
      `
      : "",
  });
};

const formatSubmissionRows = (answers = []) =>
  (() => {
    const normalized = [...(Array.isArray(answers) ? answers : [])].sort((left, right) => {
      const leftOrder = Number.isFinite(Number(left.conditionalDepth))
        ? Number(left.conditionalDepth) * 1000 + Number(left.conditionalOrder || 0)
        : 0;
      const rightOrder = Number.isFinite(Number(right.conditionalDepth))
        ? Number(right.conditionalDepth) * 1000 + Number(right.conditionalOrder || 0)
        : 0;
      return leftOrder - rightOrder;
    });
    const mainRows = [];
    const conditionalRows = [];

    normalized.forEach((answer) => {
      const row = {
        question: getSubmissionRowLabel(answer),
        context: getSubmissionRowContext(answer),
        answer: formatAnswerValue(answer),
      };
      if (answer.fieldId || answer.parentOptionId || answer.conditionalPath) {
        conditionalRows.push(row);
      } else {
        mainRows.push(row);
      }
    });

    const rows = [];
    if (mainRows.length) {
      rows.push({ kind: "section", label: "Submission Details" }, ...mainRows);
    }
    if (conditionalRows.length) {
      rows.push({ kind: "section", label: "Conditional Answers" }, ...conditionalRows);
    }
    return rows;
  })();

module.exports = {
  buildAdminFormSubmissionEmail,
  buildUserConfirmationEmail,
  formatSubmissionRows,
};
