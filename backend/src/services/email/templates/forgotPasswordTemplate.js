const forgotPasswordTemplate = ({ name = "there", resetLink }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f6fb;color:#304156;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(79,92,109,0.15);">
            <tr>
              <td style="background:linear-gradient(135deg,#2f80ed,#56ccf2);padding:36px 30px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;letter-spacing:1px;">AgriTech Password Reset</h1>
                <p style="margin:12px 0 0;font-size:16px;line-height:24px;opacity:0.9;">Secure your account with a single click.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px 24px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#3d4a5a;">Hi ${name},</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:26px;color:#556774;">We received a request to reset your AgriTech password. Click the button below to choose a new one. This link expires in 15 minutes.</p>
                <div style="text-align:center;margin:30px 0;">
                  <a href="${resetLink}" style="padding:14px 28px;background:#2f80ed;color:#ffffff;text-decoration:none;border-radius:12px;display:inline-block;font-weight:700;">Reset Password</a>
                </div>
                <p style="margin:0 0 12px;font-size:15px;line-height:26px;color:#556774;">If the button doesn’t work, copy and paste this URL into your browser:</p>
                <p style="word-break:break-word;color:#2f80ed;font-size:14px;line-height:22px;">${resetLink}</p>
                <p style="margin:28px 0 0;font-size:14px;line-height:22px;color:#94a3b8;">If you didn’t request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f6f9ff;padding:24px 30px;text-align:center;font-size:13px;line-height:20px;color:#8b98ad;">
                <p style="margin:0;">This is an automated message from AgriTech. Please do not reply directly to this email.</p>
                <p style="margin:8px 0 0;">Need help? Contact support at <a href="mailto:support@agritech.com" style="color:#2f80ed;text-decoration:none;">support@agritech.com</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default forgotPasswordTemplate;
