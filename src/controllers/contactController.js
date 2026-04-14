import ContactMessage from "../models/ContactMessage.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendMail } from "../utils/mailer.js";
import { ensureEmail, ensureRequiredString } from "../utils/validators.js";

export const createContactMessage = asyncHandler(async (req, res) => {
  const payload = {
    name: ensureRequiredString(req.body.name, "Name"),
    email: ensureEmail(req.body.email),
    message: ensureRequiredString(req.body.message, "Message"),
  };

  const contactMessage = await ContactMessage.create(payload);
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || "info@netrue.io";
  let mailResult = { sent: false, reason: "Email forwarding is not configured." };

  try {
    mailResult = await sendMail({
      to: recipient,
      subject: `New contact message from ${contactMessage.name}`,
      text: `Name: ${contactMessage.name}\nEmail: ${contactMessage.email}\n\n${contactMessage.message}`,
      html: `
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${contactMessage.name}</p>
        <p><strong>Email:</strong> ${contactMessage.email}</p>
        <p><strong>Message:</strong></p>
        <p>${contactMessage.message.replace(/\n/g, "<br />")}</p>
      `,
    });
  } catch (error) {
    mailResult = { sent: false, reason: error.message || "Unable to forward email right now." };
  }

  res.status(201).json({
    success: true,
    message: mailResult.sent
      ? "Your message was sent successfully. We will get back to you soon."
      : "Your message was saved successfully, but email forwarding is not configured yet.",
    data: {
      ...contactMessage.toObject(),
      mailSent: mailResult.sent,
      mailReason: mailResult.reason || "",
    },
  });
});
