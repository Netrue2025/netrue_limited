import Publication from "../models/Publication.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ensureOptionalString, ensureRequiredString, ensureStringArray, hasOwn } from "../utils/validators.js";

const buildPublicationPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "description")) {
    payload.description = ensureRequiredString(body.description, "Description");
  }

  if (hasOwn(body, "authors")) {
    payload.authors = ensureStringArray(body.authors, "Authors");
  } else if (!partial) {
    payload.authors = [];
  }

  if (hasOwn(body, "publishedOn")) {
    payload.publishedOn = ensureOptionalString(body.publishedOn, "Published date");
  } else if (!partial) {
    payload.publishedOn = "";
  }

  if (hasOwn(body, "pdfUrl")) {
    payload.pdfUrl = ensureOptionalString(body.pdfUrl, "PDF URL");
  } else if (!partial) {
    payload.pdfUrl = "";
  }

  if (hasOwn(body, "image")) {
    payload.image = ensureOptionalString(body.image, "Image");
  } else if (!partial) {
    payload.image = "";
  }

  return payload;
};

export const getPublications = asyncHandler(async (_req, res) => {
  const publications = await Publication.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: publications.length,
    data: publications,
  });
});

export const getPublicationById = asyncHandler(async (req, res) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    throw new ApiError(404, "Publication not found.");
  }

  res.status(200).json({
    success: true,
    data: publication,
  });
});

export const createPublication = asyncHandler(async (req, res) => {
  const payload = buildPublicationPayload(req.body);
  const publication = await Publication.create(payload);

  res.status(201).json({
    success: true,
    message: "Publication created successfully.",
    data: publication,
  });
});

export const updatePublication = asyncHandler(async (req, res) => {
  const payload = buildPublicationPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const publication = await Publication.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!publication) {
    throw new ApiError(404, "Publication not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication updated successfully.",
    data: publication,
  });
});

export const deletePublication = asyncHandler(async (req, res) => {
  const publication = await Publication.findByIdAndDelete(req.params.id);

  if (!publication) {
    throw new ApiError(404, "Publication not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication deleted successfully.",
  });
});
