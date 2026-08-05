const assert = require("assert");
const test = require("node:test");
const {
  buildUserConfirmationEmail,
} = require("../services/email/templates/formEmailTemplates");

test("renders intro text and footer background styling in confirmation emails", () => {
  const html = buildUserConfirmationEmail({
    formTitle: "Demo Form",
    submittedAt: "2026-07-28T10:00:00Z",
    successMessage: "Thanks for submitting",
    rows: [],
    publicUrl: "https://example.com",
    branding: { companyName: "TechnoSthan" },
    emailTemplate: {
      submissionIntroText: "<p>Hello from the editor</p>",
      footerBackgroundType: "image",
      footerBackgroundImageUrl: "https://cdn.example.com/footer.png",
      footerBackgroundPosition: "center",
      footerBackgroundSize: "cover",
      footerOverlayColor: "#000000",
      footerOverlayOpacity: 0.4,
      footerTextColor: "#ffffff",
      footerTextAlign: "center",
      footerMinHeight: 180,
      footerText: "Thanks for staying in touch",
      footerButtons: [],
      companyName: "TechnoSthan",
      headerTitle: "Thank you",
      headerSubtitle: "We received your response",
      bodyBackgroundColor: "#f8fafc",
      cardBackgroundColor: "#ffffff",
      accentColor: "#0ea5e9",
      textColor: "#0f172a",
      buttonColor: "#0ea5e9",
      borderRadius: 24,
    },
  });

  assert.match(html, /Hello from the editor/);
  assert.match(html, /footer\.png/);
  assert.match(html, /Thanks for staying in touch/);
  assert.match(html, /min-height:220px/);
});
