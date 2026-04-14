import PublicationService from "../models/PublicationService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureBoolean,
  ensureEnumValue,
  ensureNumber,
  ensureOptionalString,
  ensureRequiredString,
  hasOwn,
  PUBLICATION_SERVICE_TYPES
} from "../utils/validators.js";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination.js";

const buildPublicationServicePayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "serviceType")) {
    payload.serviceType = ensureEnumValue(body.serviceType, "Service type", PUBLICATION_SERVICE_TYPES);
  }

  if (!partial || hasOwn(body, "label")) {
    payload.label = ensureRequiredString(body.label, "Label");
  }

  if (hasOwn(body, "description")) {
    payload.description = ensureOptionalString(body.description, "Description");
  } else if (!partial) {
    payload.description = "";
  }

  if (!partial || hasOwn(body, "priceUsd")) {
    payload.priceUsd = ensureNumber(body.priceUsd, "USD price");
  }

  if (!partial || hasOwn(body, "priceNgn")) {
    payload.priceNgn = ensureNumber(body.priceNgn, "NGN price");
  }

  if (hasOwn(body, "isActive")) {
    payload.isActive = ensureBoolean(body.isActive, "Active");
  } else if (!partial) {
    payload.isActive = true;
  }

  return payload;
};

export const getPublicationServices = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.isActive) {
    filters.isActive = req.query.isActive === "true";
  }

  const { limit, page, skip } = resolvePagination(req.query, { defaultLimit: 20 });
  const [services, total] = await Promise.all([
    PublicationService.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PublicationService.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
    pagination: buildPaginationMeta({ page, limit, total })
  });
});

export const getPublicationServiceById = asyncHandler(async (req, res) => {
  const service = await PublicationService.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, "Publication service not found.");
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

export const createPublicationService = asyncHandler(async (req, res) => {
  const payload = buildPublicationServicePayload(req.body);
  const service = await PublicationService.create(payload);

  res.status(201).json({
    success: true,
    message: "Publication service created successfully.",
    data: service
  });
});

export const updatePublicationService = asyncHandler(async (req, res) => {
  const payload = buildPublicationServicePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const service = await PublicationService.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!service) {
    throw new ApiError(404, "Publication service not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication service updated successfully.",
    data: service
  });
});

export const deletePublicationService = asyncHandler(async (req, res) => {
  const service = await PublicationService.findByIdAndDelete(req.params.id);

  if (!service) {
    throw new ApiError(404, "Publication service not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication service deleted successfully."
  });
});
