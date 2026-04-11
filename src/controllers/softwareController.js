import Software from "../models/Software.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureBoolean,
  ensureNumber,
  ensureOptionalString,
  ensureRequiredString,
  ensureStringArray,
  hasOwn,
} from "../utils/validators.js";

const buildSoftwarePayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "description")) {
    payload.description = ensureRequiredString(body.description, "Description");
  }

  if (hasOwn(body, "downloadLink")) {
    payload.downloadLink = ensureOptionalString(body.downloadLink, "Download link");
  } else if (!partial) {
    payload.downloadLink = "";
  }

  if (hasOwn(body, "purchaseLink")) {
    payload.purchaseLink = ensureOptionalString(body.purchaseLink, "Purchase link");
  } else if (!partial) {
    payload.purchaseLink = "";
  }

  if (hasOwn(body, "image")) {
    payload.image = ensureOptionalString(body.image, "Image");
  } else if (!partial) {
    payload.image = "";
  }

  if (hasOwn(body, "features")) {
    payload.features = ensureStringArray(body.features, "Features");
  } else if (!partial) {
    payload.features = [];
  }

  const hasIsFree = hasOwn(body, "isFree");
  const hasPrice = hasOwn(body, "price");

  if (!partial || hasIsFree) {
    payload.isFree = ensureBoolean(body.isFree, "isFree");
  }

  if (!partial || hasPrice) {
    payload.price = ensureNumber(body.price ?? 0, "Price");
  }

  const resolvedIsFree = hasIsFree ? payload.isFree : undefined;
  const resolvedPrice = hasPrice ? payload.price : undefined;

  if (!partial) {
    if (!payload.isFree && payload.price <= 0) {
      throw new ApiError(400, "Price must be greater than 0 when the software is not free.");
    }

    if (payload.isFree) {
      payload.price = 0;
    }

    payload.pricingModel = payload.isFree ? "Free" : "Paid";
  } else {
    if (resolvedIsFree === true) {
      payload.price = 0;
    }

    if (resolvedIsFree === false && resolvedPrice !== undefined && resolvedPrice <= 0) {
      throw new ApiError(400, "Price must be greater than 0 when the software is not free.");
    }

    if (hasOwn(payload, "isFree")) {
      payload.pricingModel = payload.isFree ? "Free" : "Paid";
    }
  }

  return payload;
};

export const getSoftware = asyncHandler(async (_req, res) => {
  const software = await Software.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: software.length,
    data: software,
  });
});

export const getSoftwareById = asyncHandler(async (req, res) => {
  const software = await Software.findById(req.params.id);

  if (!software) {
    throw new ApiError(404, "Software record not found.");
  }

  res.status(200).json({
    success: true,
    data: software,
  });
});

export const createSoftware = asyncHandler(async (req, res) => {
  const payload = buildSoftwarePayload(req.body);

  if (!payload.downloadLink && !payload.purchaseLink) {
    throw new ApiError(400, "Provide at least a download link or a purchase link.");
  }

  const software = await Software.create(payload);

  res.status(201).json({
    success: true,
    message: "Software record created successfully.",
    data: software,
  });
});

export const updateSoftware = asyncHandler(async (req, res) => {
  const existingSoftware = await Software.findById(req.params.id);

  if (!existingSoftware) {
    throw new ApiError(404, "Software record not found.");
  }

  const payload = buildSoftwarePayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const nextIsFree = hasOwn(payload, "isFree") ? payload.isFree : existingSoftware.isFree;
  const nextPrice = hasOwn(payload, "price") ? payload.price : existingSoftware.price;
  const nextDownloadLink = hasOwn(payload, "downloadLink") ? payload.downloadLink : existingSoftware.downloadLink;
  const nextPurchaseLink = hasOwn(payload, "purchaseLink") ? payload.purchaseLink : existingSoftware.purchaseLink;

  if (!nextIsFree && nextPrice <= 0) {
    throw new ApiError(400, "Price must be greater than 0 when the software is not free.");
  }

  if (!nextDownloadLink && !nextPurchaseLink) {
    throw new ApiError(400, "Provide at least a download link or a purchase link.");
  }

  if (nextIsFree) {
    payload.price = 0;
  }

  payload.pricingModel = nextIsFree ? "Free" : "Paid";

  const software = await Software.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Software record updated successfully.",
    data: software,
  });
});

export const deleteSoftware = asyncHandler(async (req, res) => {
  const software = await Software.findByIdAndDelete(req.params.id);

  if (!software) {
    throw new ApiError(404, "Software record not found.");
  }

  res.status(200).json({
    success: true,
    message: "Software record deleted successfully.",
  });
});
