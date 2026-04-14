import nodemailer from "nodemailer";

let transporterPromise;

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(createTransporter());
  }

  return transporterPromise;
}

export async function sendMail({ attachments = [], html, subject, text, to }) {
  const transporter = await getTransporter();

  if (!transporter) {
    return { sent: false, reason: "SMTP not configured" };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return { sent: true };
}
