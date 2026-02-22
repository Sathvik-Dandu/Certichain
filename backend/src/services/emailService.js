const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not defined. Please add it to .env or deployment settings.");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn("Resend not configured. Skipping email send.");
    return false;
  }
  try {
    const data = await resend.emails.send({
      from: "CertiChain <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    console.log("Email sent successfully", data);
    return true;
  } catch (error) {
    console.error("Resend error:", error);
    throw error;
  }
};

const getCertificateEmailTemplate = (studentName, certificateUrl, details) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CertiChain</h1>
        <p style="color: #e0e7ff; margin: 5px 0 0;">Blockchain-Verified Credentialing</p>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear <strong>${studentName}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
          This is an official notification to inform you that <strong>${details.institutionName}</strong> has successfully issued your digital certificate on the CertiChain blockchain platform.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #4F46E5; padding: 15px 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px; color: #333; font-size: 16px;">Certificate Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: #555;">
            <li style="padding: 5px 0;"><strong>Institution:</strong> ${details.institutionName}</li>
            <li style="padding: 5px 0;"><strong>Course:</strong> ${details.courseName}</li>
            <li style="padding: 5px 0;"><strong>Year:</strong> ${details.passOutYear}</li>
            <li style="padding: 5px 0;"><strong>Certificate ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 3px;">${details.certificateId}</span></li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${certificateUrl}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
            View Certificate
          </a>
        </div>
      </div>

      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0;">© 2026 CertiChain Platform. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an automated system email. Please do not reply.</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  getCertificateEmailTemplate
};
