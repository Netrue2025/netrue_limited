import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureEnumValue,
  ensureOptionalString,
  ensureStringArray,
  ensureRequiredString,
  hasOwn,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
} from "../utils/validators.js";

const buildProductPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "description")) {
    payload.description = ensureRequiredString(body.description, "Description");
  }

  if (!partial || hasOwn(body, "category")) {
    payload.category = ensureEnumValue(body.category, "Category", PRODUCT_CATEGORIES);
  }

  if (hasOwn(body, "image")) {
    payload.image = ensureOptionalString(body.image, "Image");
  } else if (!partial) {
    payload.image = "";
  }

  if (hasOwn(body, "status")) {
    payload.status = ensureEnumValue(body.status, "Status", PRODUCT_STATUSES);
  } else if (!partial) {
    payload.status = "Available";
  }

  if (hasOwn(body, "specs")) {
    payload.specs = ensureStringArray(body.specs, "Specs");
  } else if (!partial) {
    payload.specs = [];
  }

  return payload;
};

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body);
  const product = await Product.create(payload);

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully.",
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});
