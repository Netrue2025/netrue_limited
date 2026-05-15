import CompanyProfile from "../models/CompanyProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination.js";
import { ensureBoolean, ensureEmail, ensureOptionalString, ensureRequiredString, hasOwn } from "../utils/validators.js";

const buildCompanyProfilePayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "companyName")) {
    payload.companyName = ensureRequiredString(body.companyName, "Company name");
  }

  ["logo", "phone", "address", "website", "taxId", "receiptNote"].forEach((fieldName) => {
    if (hasOwn(body, fieldName)) {
      payload[fieldName] = ensureOptionalString(body[fieldName], fieldName);
    } else if (!partial) {
      payload[fieldName] = "";
    }
  });

  if (hasOwn(body, "email")) {
    payload.email = body.email ? ensureEmail(body.email) : "";
  } else if (!partial) {
    payload.email = "";
  }

  if (hasOwn(body, "isActive")) {
    payload.isActive = ensureBoolean(body.isActive, "Active");
  } else if (!partial) {
    payload.isActive = true;
  }

  return payload;
};

export const getCompanyProfiles = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.isActive) {
    filters.isActive = req.query.isActive === "true";
  }

  const { limit, page, skip } = resolvePagination(req.query, { defaultLimit: 20 });
  const [profiles, total] = await Promise.all([
    CompanyProfile.find(filters).sort({ isActive: -1, createdAt: -1 }).skip(skip).limit(limit),
    CompanyProfile.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles,
    pagination: buildPaginationMeta({ page, limit, total }),
  });
});

export const getCompanyProfileById = asyncHandler(async (req, res) => {
  const profile = await CompanyProfile.findById(req.params.id);

  if (!profile) {
    throw new ApiError(404, "Company profile not found.");
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const createCompanyProfile = asyncHandler(async (req, res) => {
  const payload = buildCompanyProfilePayload(req.body);
  const profile = await CompanyProfile.create(payload);

  res.status(201).json({
    success: true,
    message: "Company profile created successfully.",
    data: profile,
  });
});

export const updateCompanyProfile = asyncHandler(async (req, res) => {
  const payload = buildCompanyProfilePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const profile = await CompanyProfile.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!profile) {
    throw new ApiError(404, "Company profile not found.");
  }

  res.status(200).json({
    success: true,
    message: "Company profile updated successfully.",
    data: profile,
  });
});

export const deleteCompanyProfile = asyncHandler(async (req, res) => {
  const profile = await CompanyProfile.findByIdAndDelete(req.params.id);

  if (!profile) {
    throw new ApiError(404, "Company profile not found.");
  }

  res.status(200).json({
    success: true,
    message: "Company profile deleted successfully.",
  });
});
