const nodemailer = require("nodemailer");

let transporter;

const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    return transporter;
  }

  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const activeTransporter = await getTransporter();
  const from = process.env.SMTP_FROM || "no-reply@interna.local";

  const result = await activeTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return result;
};

module.exports = {
  sendEmail,
};
