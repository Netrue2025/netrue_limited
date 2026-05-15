import PaymentService from "../models/PaymentService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination.js";
import { ensureBoolean, ensureNumber, ensureOptionalString, ensureRequiredString, hasOwn } from "../utils/validators.js";

const buildPaymentServicePayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "name")) {
    payload.name = ensureRequiredString(body.name, "Service name");
  }

  if (!partial || hasOwn(body, "code")) {
    payload.code = ensureRequiredString(body.code, "Service code")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  if (hasOwn(body, "description")) {
    payload.description = ensureOptionalString(body.description, "Description");
  } else if (!partial) {
    payload.description = "";
  }

  if (hasOwn(body, "suggestedAmount")) {
    payload.suggestedAmount = Math.max(0, ensureNumber(body.suggestedAmount, "Suggested amount"));
  } else if (!partial) {
    payload.suggestedAmount = 0;
  }

  if (hasOwn(body, "isActive")) {
    payload.isActive = ensureBoolean(body.isActive, "Active");
  } else if (!partial) {
    payload.isActive = true;
  }

  return payload;
};

export const getPaymentServices = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.isActive) {
    filters.isActive = req.query.isActive === "true";
  }

  const { limit, page, skip } = resolvePagination(req.query, { defaultLimit: 20 });
  const [services, total] = await Promise.all([
    PaymentService.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PaymentService.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
    pagination: buildPaginationMeta({ page, limit, total }),
  });
});

export const getPaymentServiceById = asyncHandler(async (req, res) => {
  const service = await PaymentService.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, "Payment service not found.");
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

export const createPaymentService = asyncHandler(async (req, res) => {
  const payload = buildPaymentServicePayload(req.body);
  const service = await PaymentService.create(payload);

  res.status(201).json({
    success: true,
    message: "Payment service created successfully.",
    data: service,
  });
});

export const updatePaymentService = asyncHandler(async (req, res) => {
  const payload = buildPaymentServicePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const service = await PaymentService.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    throw new ApiError(404, "Payment service not found.");
  }

  res.status(200).json({
    success: true,
    message: "Payment service updated successfully.",
    data: service,
  });
});

export const deletePaymentService = asyncHandler(async (req, res) => {
  const service = await PaymentService.findByIdAndDelete(req.params.id);

  if (!service) {
    throw new ApiError(404, "Payment service not found.");
  }

  res.status(200).json({
    success: true,
    message: "Payment service deleted successfully.",
  });
});
