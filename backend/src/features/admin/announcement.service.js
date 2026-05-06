import nodemailer from "nodemailer";

// Initialize email transporter
let emailTransporter = null;
const getEmailTransporter = () => {
  if (!emailTransporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify the connection
    emailTransporter.verify((error, success) => {
      if (error) {
        console.error("Email transporter verification failed:", error);
      } else {
        console.log("Email transporter is ready to send emails");
      }
    });
  }
  return emailTransporter;
};

// Send announcement email to a single user
export const sendAnnouncementEmail = async (user, announcement) => {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const priorityColors = {
    low: "#6c757d",
    medium: "#007bff",
    high: "#fd7e14",
    urgent: "#dc3545",
  };

  const typeColors = {
    info: "#17a2b8",
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `AgriTech Announcement: ${announcement.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">AgriTech</h1>
            <p style="color: #6c757d; margin: 5px 0;">Smart Agriculture Solutions</p>
          </div>

          <div style="background-color: ${typeColors[announcement.type]}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">${announcement.title}</h2>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="color: #495057; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              ${announcement.message.replace(/\n/g, "<br>")}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: table; width: 100%;">
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 5px 0; font-weight: bold; color: #495057;">Priority:</div>
                <div style="display: table-cell; padding: 5px 0; color: ${priorityColors[announcement.priority]}; font-weight: bold;">
                  ${announcement.priority.toUpperCase()}
                </div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 5px 0; font-weight: bold; color: #495057;">Type:</div>
                <div style="display: table-cell; padding: 5px 0; color: ${typeColors[announcement.type]}; font-weight: bold;">
                  ${announcement.type.toUpperCase()}
                </div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 5px 0; font-weight: bold; color: #495057;">Created:</div>
                <div style="display: table-cell; padding: 5px 0; color: #6c757d;">
                  ${new Date(announcement.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || "https://agritech-app.com"}/dashboard"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This is an automated announcement from AgriTech. Please do not reply to this message.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Announcement email sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send announcement email to ${user.email}:`, error);
    throw error;
  }
};

// Send announcement emails to multiple users
export const sendBulkAnnouncementEmails = async (users, announcement) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (const user of users) {
    try {
      await sendAnnouncementEmail(user, announcement);
      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        user: user.email,
        error: error.message,
      });
    }
  }

  return results;
};

// Export the transporter getter for initialization
export { getEmailTransporter };
