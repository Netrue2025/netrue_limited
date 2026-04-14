import asyncHandler from "../utils/asyncHandler.js";
import { initializePaystackTransaction, verifyPaystackTransaction } from "../utils/paystack.js";
import { ensureEmail, ensureNumber, ensureRequiredString } from "../utils/validators.js";

export const initializeTransaction = asyncHandler(async (req, res) => {
  const payload = {
    email: ensureEmail(req.body.email),
    amount: Math.round(ensureNumber(req.body.amount, "Amount") * 100),
    metadata: req.body.metadata || {},
    currency: "NGN",
    callback_url: req.body.callbackUrl || undefined,
    reference: req.body.reference ? ensureRequiredString(req.body.reference, "Reference") : undefined,
  };

  const transaction = await initializePaystackTransaction(payload);

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

export const verifyTransaction = asyncHandler(async (req, res) => {
  const transaction = await verifyPaystackTransaction(ensureRequiredString(req.params.reference, "Reference"));

  res.status(200).json({
    success: true,
    data: transaction,
  });
});
