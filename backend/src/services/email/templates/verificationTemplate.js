const verificationTemplate = ({ name = "there", otp }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f6f8fb;color:#24303f;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(32,40,55,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#0f766e,#22c55e);padding:36px 30px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;">Verify your AgriTech account</h1>
                <p style="margin:12px 0 0;font-size:16px;line-height:24px;opacity:0.92;">A quick step to keep your data safe.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#2e3a4b;">Hello ${name},</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:26px;color:#576579;">Please confirm your email address by entering the verification code below in the AgriTech app.</p>
                <div style="text-align:center;margin:0 0 26px;">
                  <div style="display:inline-block;padding:24px 34px;border-radius:20px;background:#f9fafb;border:1px solid #dbe4ef;font-size:36px;font-weight:700;letter-spacing:8px;color:#0f766e;">${otp}</div>
                </div>
                <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#7a8698;">This code will expire in 10 minutes. For your protection, do not share it with anyone.</p>
                <p style="margin:0;font-size:14px;line-height:22px;color:#7a8698;">If you did not create an AgriTech account, please ignore this message.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3fbf8;padding:24px 30px;text-align:center;font-size:13px;line-height:20px;color:#617d79;">
                <p style="margin:0;">Thank you for choosing AgriTech. We're here to help at <a href="mailto:support@agritech.com" style="color:#0f766e;text-decoration:none;">support@agritech.com</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default verificationTemplate;
