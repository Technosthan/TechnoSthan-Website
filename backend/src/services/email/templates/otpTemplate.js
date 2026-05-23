const otpTemplate = ({ name = "there", otp }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#eef4fb;color:#2d3a4a;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(79,92,109,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#0ea5e9,#5b21b6);padding:36px 30px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;">Your AgriTech OTP Code</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#3d4a5a;">Hi ${name},</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:26px;color:#556774;">Use the code below to complete your verification. The code expires in 10 minutes.</p>
                <div style="text-align:center;margin:0 0 26px;">
                  <div style="display:inline-block;padding:22px 32px;border-radius:20px;background:linear-gradient(135deg,#ffffff,#f8fafc);box-shadow:0 16px 35px rgba(15,23,42,0.08);font-size:36px;font-weight:700;letter-spacing:6px;color:#1d4ed8;">${otp}</div>
                </div>
                <p style="margin:0 0 18px;font-size:14px;line-height:22px;color:#7c8899;">Never share this code with anyone. AgriTech will never ask you for it.</p>
                <p style="margin:0;font-size:14px;line-height:22px;color:#7c8899;">If you did not request this code, please secure your account immediately.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f7fbff;padding:24px 30px;border-top:1px solid #e2e8f0;color:#6b7280;font-size:13px;line-height:20px;text-align:center;">
                <p style="margin:0;">This code is valid for 10 minutes and can only be used once.</p>
                <p style="margin:8px 0 0;">Need help? Email <a href="mailto:support@agritech.com" style="color:#0ea5e9;text-decoration:none;">support@agritech.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default otpTemplate;
