const nodemailer = require("nodemailer");

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass }
    });
  }

  return transporter;
}

async function sendMail(to, subject, html) {
  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: process.env.SMTP_FROM || "Spitfire <no-reply@spitfire.local>",
    to, subject, html
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("Email preview: " + preview);
}

module.exports = { sendMail };
