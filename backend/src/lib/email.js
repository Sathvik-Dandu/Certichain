const sgMail = require("@sendgrid/mail");

if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY not defined in environment variables");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
    const msg = {
        to,
        from: "CertiChain Team <sathvik.digitalconnect@gmail.com>",
        subject,
        html,
    };

    try {
        const response = await sgMail.send(msg);
        console.log("SendGrid status:", response[0].statusCode);
        return true;
    } catch (error) {
        console.error("SendGrid error:", error.response?.body || error);
        return false;
    }
}

module.exports = { sendEmail };
