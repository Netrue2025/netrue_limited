import ContactMessage from "../models/ContactMessage.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ensureEmail, ensureRequiredString } from "../utils/validators.js";

export const createContactMessage = asyncHandler(async (req, res) => {
  const payload = {
    name: ensureRequiredString(req.body.name, "Name"),
    email: ensureEmail(req.body.email),
    message: ensureRequiredString(req.body.message, "Message"),
  };

  const contactMessage = await ContactMessage.create(payload);

  res.status(201).json({
    success: true,
    message: "Contact message submitted successfully.",
    data: contactMessage,
  });
});
