const User = require("../models/User");
const { getRoleVariants, normalizeRole } = require("../constants/rbac");
const { sendEmail } = require("../services/email/sendEmail");
const { buildUserConfirmationEmail } = require("../services/email/templates/formEmailTemplates");

// GET /api/admin/users?q=search
const getUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const role = normalizeRole(req.query.role);
    const ids = String(req.query.ids || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const filter = { isActive: true };
    if (ids.length > 0) {
      filter._id = { $in: ids };
    }
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: re }, { email: re }];
    }
    if (req.query.role) {
      filter.role = { $in: getRoleVariants(role) };
    }

    const rows = await User.find(filter)
      .limit(50)
      .select("_id name email role")
      .lean();

    const users = rows.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Get admin users error:", err);
    res.status(500).json({ success: false, message: "Unable to load users" });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const websiteUrl =
      process.env.FRONTEND_URL ||
      process.env.VITE_PUBLIC_URL ||
      "";

    await sendEmail({
      to: email,
      subject: "TechnoSthan SendGrid test email",
      html: buildUserConfirmationEmail({
        formTitle: "TechnoSthan Email Test",
        submittedAt: new Date().toISOString(),
        successMessage: "This is a branded test email from the TechnoSthan backend.",
        rows: [
          {
            question: "Provider",
            answer: "SendGrid",
          },
          {
            question: "Environment",
            answer: process.env.NODE_ENV || "development",
          },
        ],
        publicUrl: websiteUrl,
        branding: {
          companyName: "TechnoSthan",
          brandWebsiteUrl: websiteUrl,
          footerText: "If you received this message, SendGrid delivery is working correctly.",
        },
        emailTemplate: {
          companyName: "TechnoSthan",
          headerTitle: "Email Delivery Test",
          headerSubtitle: "SendGrid integration check",
          successMessage: "SendGrid email delivery is configured correctly.",
          footerText: "TechnoSthan email infrastructure test.",
          websiteButtonText: "Open Website",
          websiteButtonUrl: websiteUrl,
        },
      }),
      text:
        "TechnoSthan email delivery test. SendGrid is configured correctly.",
    });

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: "Unable to send test email",
    });
  }
};

module.exports = {
  getUsers,
  sendTestEmail,
};
