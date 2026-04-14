import ShopCategory from "../models/ShopCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ensureBoolean, ensureOptionalString, ensureRequiredString, hasOwn } from "../utils/validators.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildShopCategoryPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "name")) {
    payload.name = ensureRequiredString(body.name, "Name");
  }

  if (hasOwn(body, "slug")) {
    payload.slug = slugify(ensureRequiredString(body.slug, "Slug"));
  } else if (hasOwn(payload, "name")) {
    payload.slug = slugify(payload.name);
  } else if (!partial) {
    throw new ApiError(400, "Slug is required.");
  }

  if (hasOwn(body, "description")) {
    payload.description = ensureOptionalString(body.description, "Description");
  } else if (!partial) {
    payload.description = "";
  }

  if (hasOwn(body, "isActive")) {
    payload.isActive = ensureBoolean(body.isActive, "Active flag");
  } else if (!partial) {
    payload.isActive = true;
  }

  return payload;
};

export const getShopCategories = asyncHandler(async (_req, res) => {
  const categories = await ShopCategory.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

export const getShopCategoryById = asyncHandler(async (req, res) => {
  const category = await ShopCategory.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Shop category not found.");
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const createShopCategory = asyncHandler(async (req, res) => {
  const category = await ShopCategory.create(buildShopCategoryPayload(req.body));

  res.status(201).json({
    success: true,
    message: "Shop category created successfully.",
    data: category,
  });
});

export const updateShopCategory = asyncHandler(async (req, res) => {
  const payload = buildShopCategoryPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const category = await ShopCategory.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ApiError(404, "Shop category not found.");
  }

  res.status(200).json({
    success: true,
    message: "Shop category updated successfully.",
    data: category,
  });
});

export const deleteShopCategory = asyncHandler(async (req, res) => {
  const category = await ShopCategory.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new ApiError(404, "Shop category not found.");
  }

  res.status(200).json({
    success: true,
    message: "Shop category deleted successfully.",
  });
});
