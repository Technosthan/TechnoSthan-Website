const welcomeTemplate = ({ name = "there" }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f7f9fc;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:36px 30px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:30px;line-height:1.1;">Welcome to AgriTech</h1>
                <p style="margin:12px 0 0;font-size:16px;line-height:24px;opacity:0.92;">Your next stage in smarter farming begins now.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#1f2937;">Hi ${name},</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:26px;color:#4b5563;">Thanks for joining AgriTech. We’re excited to help you manage operations more efficiently, grow smarter, and stay ahead with data-driven insights.</p>
                <div style="background:#f8fafc;border-radius:20px;padding:24px;margin:0 0 24px;">
                  <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">What’s next?</h2>
                  <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:26px;font-size:15px;">
                    <li>Set up your profile and fields</li>
                    <li>Invite team members and collaborate</li>
                    <li>Enable notifications for critical alerts</li>
                  </ul>
                </div>
                <div style="text-align:center;margin-bottom:26px;">
                  <a href="https://app.agritech.com/dashboard" style="display:inline-block;padding:14px 28px;background:#3b82f6;color:#ffffff;text-decoration:none;border-radius:14px;font-weight:700;">Go to dashboard</a>
                </div>
                <p style="margin:0;font-size:14px;line-height:22px;color:#6b7280;">If you need help getting started, reply to this email or reach out to <a href="mailto:support@agritech.com" style="color:#3b82f6;text-decoration:none;">support@agritech.com</a>.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6;padding:24px 30px;text-align:center;font-size:13px;line-height:20px;color:#6b7280;">
                <p style="margin:0;">AgriTech — Smarter farming, powered by modern technology.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default welcomeTemplate;
