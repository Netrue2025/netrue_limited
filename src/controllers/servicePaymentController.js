import CompanyProfile from "../models/CompanyProfile.js";
import PaymentService from "../models/PaymentService.js";
import ServicePayment from "../models/ServicePayment.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination.js";
import { sendMail } from "../utils/mailer.js";
import { verifyPaystackTransaction } from "../utils/paystack.js";
import { buildPaymentReceiptEmail, buildPaymentReceiptHtml } from "../utils/serviceReceipt.js";
import {
  ensureEmail,
  ensureEnumValue,
  ensureNumber,
  ensureOptionalString,
  ensureRequiredString,
  hasOwn,
  PAYMENT_TYPES,
  SERVICE_PAYMENT_STATUSES,
} from "../utils/validators.js";

const buildReceiptNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NET-${datePart}-${randomPart}`;
};

const buildCompanySnapshot = (profile) => ({
  companyName: profile?.companyName || "Netrue Limited",
  logo: profile?.logo || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  address: profile?.address || "",
  website: profile?.website || "",
  taxId: profile?.taxId || "",
  receiptNote: profile?.receiptNote || "Thank you for your payment.",
});

const sendPaymentReceipt = async (payment) => {
  const emailContent = buildPaymentReceiptEmail(payment);
  const receiptHtml = buildPaymentReceiptHtml(payment);

  return sendMail({
    to: payment.customerEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
    attachments: [
      {
        filename: `${payment.receiptNumber || "payment-receipt"}.html`,
        content: receiptHtml,
        contentType: "text/html",
      },
    ],
  });
};

const buildServicePaymentPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "serviceName")) {
    payload.serviceName = ensureRequiredString(body.serviceName, "Service name");
  }

  if (hasOwn(body, "serviceId")) {
    const serviceId = ensureOptionalString(body.serviceId, "Service");

    if (serviceId) {
      payload.serviceId = serviceId;
    }
  }

  if (!partial || hasOwn(body, "customerName")) {
    payload.customerName = ensureRequiredString(body.customerName, "Customer name");
  }

  if (!partial || hasOwn(body, "customerEmail")) {
    payload.customerEmail = ensureEmail(body.customerEmail);
  }

  if (hasOwn(body, "customerPhone")) {
    payload.customerPhone = ensureOptionalString(body.customerPhone, "Customer phone");
  } else if (!partial) {
    payload.customerPhone = "";
  }

  if (!partial || hasOwn(body, "amount")) {
    payload.amount = ensureNumber(body.amount, "Amount");
  }

  if (!partial || hasOwn(body, "paymentType")) {
    payload.paymentType = ensureEnumValue(body.paymentType || "full", "Payment type", PAYMENT_TYPES);
  }

  if (hasOwn(body, "expectedBalance")) {
    payload.expectedBalance = Math.max(0, ensureNumber(body.expectedBalance, "Expected balance"));
  } else if (!partial) {
    payload.expectedBalance = 0;
  }

  if (!partial || hasOwn(body, "paystackReference")) {
    payload.paystackReference = ensureRequiredString(body.paystackReference, "Paystack reference");
  }

  if (hasOwn(body, "paymentStatus")) {
    payload.paymentStatus = ensureEnumValue(body.paymentStatus, "Payment status", SERVICE_PAYMENT_STATUSES);
  } else if (!partial) {
    payload.paymentStatus = "paid";
  }

  return payload;
};

export const getServicePayments = asyncHandler(async (req, res) => {
  const { limit, page, skip } = resolvePagination(req.query, { defaultLimit: 20 });
  const [payments, total] = await Promise.all([
    ServicePayment.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ServicePayment.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
    pagination: buildPaginationMeta({ page, limit, total }),
  });
});

export const getServicePaymentById = asyncHandler(async (req, res) => {
  const payment = await ServicePayment.findById(req.params.id);

  if (!payment) {
    throw new ApiError(404, "Service payment not found.");
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

export const createServicePayment = asyncHandler(async (req, res) => {
  const payload = buildServicePaymentPayload(req.body);
  const existingPayment = await ServicePayment.findOne({ paystackReference: payload.paystackReference });

  if (existingPayment) {
    return res.status(200).json({
      success: true,
      message: "Payment already recorded.",
      data: existingPayment,
    });
  }

  const transaction = await verifyPaystackTransaction(payload.paystackReference);
  const paidAmount = Number(transaction?.amount || 0) / 100;

  if (transaction?.status !== "success" || paidAmount + 0.01 < Number(payload.amount || 0)) {
    throw new ApiError(400, "Paystack payment could not be verified for this amount.");
  }

  const [profile, service] = await Promise.all([
    CompanyProfile.findOne({ isActive: true }).sort({ createdAt: -1 }),
    payload.serviceId ? PaymentService.findById(payload.serviceId) : null,
  ]);

  const payment = await ServicePayment.create({
    ...payload,
    serviceName: service?.name || payload.serviceName,
    receiptNumber: buildReceiptNumber(),
    paymentStatus: "paid",
    companySnapshot: buildCompanySnapshot(profile),
    paidAt: transaction?.paid_at ? new Date(transaction.paid_at) : new Date(),
  });
  let mailResult = { sent: false, reason: "Email receipt is not configured." };

  try {
    mailResult = await sendPaymentReceipt(payment);
  } catch (error) {
    mailResult = { sent: false, reason: error.message || "Unable to send receipt email right now." };
  }

  res.status(201).json({
    success: true,
    message: mailResult.sent
      ? "Payment recorded successfully and receipt email sent."
      : "Payment recorded successfully, but receipt email was not sent.",
    data: {
      ...payment.toObject(),
      receiptEmailSent: mailResult.sent,
      receiptEmailReason: mailResult.reason || "",
    },
  });
});

export const updateServicePayment = asyncHandler(async (req, res) => {
  const payload = buildServicePaymentPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const payment = await ServicePayment.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!payment) {
    throw new ApiError(404, "Service payment not found.");
  }

  res.status(200).json({
    success: true,
    message: "Service payment updated successfully.",
    data: payment,
  });
});

export const deleteServicePayment = asyncHandler(async (req, res) => {
  const payment = await ServicePayment.findByIdAndDelete(req.params.id);

  if (!payment) {
    throw new ApiError(404, "Service payment not found.");
  }

  res.status(200).json({
    success: true,
    message: "Service payment deleted successfully.",
  });
});
