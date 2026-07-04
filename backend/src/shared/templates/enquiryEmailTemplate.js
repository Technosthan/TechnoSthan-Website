const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const enquiryAdminEmailTemplate = ({
  fullName,
  email,
  phone,
  category,
  interestedArea,
  message,
  createdAt,
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Enquiry - TechnoSthan Innovation Hub</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#14213d;">
    <div style="max-width:680px;margin:30px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(20,33,61,0.12);">
      <div style="background:linear-gradient(135deg,#0f2d57 0%,#1d77ff 100%);padding:28px 32px;color:#ffffff;">
        <h1 style="margin:0 0 8px;font-size:28px;">TechnoSthan Innovation Hub</h1>
        <p style="margin:0;font-size:14px;opacity:0.92;">Research • Innovation • Technical Skill Development</p>
      </div>

      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="margin:0 0 8px;font-size:24px;color:#0f2d57;">New Enquiry Received</h2>
          <p style="margin:0;color:#5c6b82;font-size:14px;">A new enquiry has been submitted through the website.</p>
        </div>

        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;width:140px;">👤 Full Name</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">📧 Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${email}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">📱 Phone</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${phone}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">🎓 Category</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${category}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">💡 Interested Area</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${interestedArea}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">📝 Message</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${message}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;font-weight:bold;color:#0f2d57;">📅 Date & Time</td>
            <td style="padding:10px 0;border-bottom:1px solid #e7edf5;color:#21304f;">${formatDate(createdAt)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-weight:bold;color:#0f2d57;">🌐 Website</td>
            <td style="padding:10px 0;color:#21304f;">innovationhub.technosthan.com</td>
          </tr>
        </table>
      </div>

      <div style="padding:0 32px 32px;">
        <div style="background:#f7fbff;border:1px solid #dcecff;border-radius:14px;padding:18px 20px;color:#4f6483;line-height:1.6;">
          <p style="margin:0 0 8px;">This enquiry was automatically generated from the TechnoSthan Innovation Hub website.</p>
          <p style="margin:0;">Please contact the user as soon as possible.</p>
        </div>
      </div>

      <div style="background:#0f2d57;padding:24px 32px;text-align:center;color:#dcefff;font-size:13px;line-height:1.6;">
        <p style="margin:0 0 6px;font-weight:bold;">TechnoSthan Innovation Hub</p>
        <p style="margin:0;">www.technosthan.com</p>
      </div>
    </div>
  </body>
</html>
`;

export const enquiryThankYouEmailTemplate = ({ fullName }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thank You for Contacting TechnoSthan</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#14213d;">
    <div style="max-width:680px;margin:30px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(20,33,61,0.12);">
      <div style="background:linear-gradient(135deg,#0f2d57 0%,#1d77ff 100%);padding:28px 32px;color:#ffffff;">
        <h1 style="margin:0 0 8px;font-size:26px;">Thank You for Contacting TechnoSthan Innovation Hub</h1>
        <p style="margin:0;font-size:14px;opacity:0.92;">Research • Innovation • Technical Skill Development</p>
      </div>

      <div style="padding:32px;color:#21304f;line-height:1.8;">
        <p style="margin:0 0 14px;">Hello ${fullName},</p>
        <p style="margin:0 0 14px;">Thank you for contacting TechnoSthan Innovation Hub.</p>
        <p style="margin:0 0 14px;">We have successfully received your enquiry.</p>
        <p style="margin:0 0 14px;">Our team will review your request and contact you shortly.</p>
        <p style="margin:0 0 14px;">Meanwhile, you can explore our programs and workshops on our website.</p>
        <p style="margin:0 0 20px;">Best Regards,</p>
        <p style="margin:0;font-weight:bold;">TechnoSthan Innovation Hub</p>
        <p style="margin:4px 0 0;">Research • Innovation • Technical Skill Development</p>
      </div>

      <div style="background:#0f2d57;padding:24px 32px;text-align:center;color:#dcefff;font-size:13px;line-height:1.6;">
        <p style="margin:0;">www.technosthan.com</p>
      </div>
    </div>
  </body>
</html>
`;
