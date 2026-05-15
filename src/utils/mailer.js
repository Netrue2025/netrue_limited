import nodemailer from "nodemailer";

let transporterPromise;

function stripWrappingQuotes(value = "") {
  return value.trim().replace(/^["']|["']$/g, "");
}

function resolveSecureFlag(port, secureValue) {
  if (secureValue === "true") {
    return true;
  }

  if (Number(port) === 465) {
    return true;
  }

  if (secureValue === "false") {
    return false;
  }

  return false;
}

function resolveMailFrom() {
  const smtpUser = stripWrappingQuotes(process.env.SMTP_USER || "");
  const configuredFrom = stripWrappingQuotes(process.env.MAIL_FROM || "");

  if (!configuredFrom) {
    return smtpUser;
  }

  if (configuredFrom.includes("@")) {
    return configuredFrom;
  }

  return `"${configuredFrom}" <${smtpUser}>`;
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  const smtpHost = stripWrappingQuotes(SMTP_HOST || "");
  const smtpPort = stripWrappingQuotes(SMTP_PORT || "");
  const smtpUser = stripWrappingQuotes(SMTP_USER || "");
  const smtpPass = stripWrappingQuotes(SMTP_PASS || "");

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: resolveSecureFlag(smtpPort, stripWrappingQuotes(SMTP_SECURE || "")),
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
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
    from: resolveMailFrom(),
    to,
    subject,
    text,
    html,
    attachments,
  });

  return { sent: true };
}
