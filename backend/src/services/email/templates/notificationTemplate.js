const notificationTemplate = ({
  name = "there",
  title = "Update from AgriTech",
  message = "You have a new notification.",
  ctaUrl = "https://app.agritech.com/dashboard",
}) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f0f4fb;color:#24303f;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 22px 65px rgba(41,52,72,0.1);">
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:36px 30px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;line-height:1.1;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#2a3b53;">Hello ${name},</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:26px;color:#515f74;">${message}</p>
                <div style="text-align:center;margin-bottom:26px;">
                  <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:14px;font-weight:700;">View details</a>
                </div>
                <p style="margin:0;font-size:14px;line-height:22px;color:#718096;">This email was sent to keep you informed about important updates in AgriTech.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f6fb;padding:24px 30px;text-align:center;font-size:13px;line-height:20px;color:#6b7280;">
                <p style="margin:0;">Need help? Email us at <a href="mailto:support@agritech.com" style="color:#1d4ed8;text-decoration:none;">support@agritech.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default notificationTemplate;
