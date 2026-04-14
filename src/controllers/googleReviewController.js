import GoogleReview from "../models/GoogleReview.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ensureBoolean, ensureNumber, ensureOptionalString, ensureRequiredString, hasOwn } from "../utils/validators.js";

const buildGoogleReviewPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "reviewerName")) {
    payload.reviewerName = ensureRequiredString(body.reviewerName, "Reviewer name");
  }

  if (!partial || hasOwn(body, "rating")) {
    payload.rating = ensureNumber(body.rating, "Rating");
  }

  if (!partial || hasOwn(body, "reviewText")) {
    payload.reviewText = ensureRequiredString(body.reviewText, "Review text");
  }

  if (!partial || hasOwn(body, "sourceUrl")) {
    payload.sourceUrl = ensureRequiredString(body.sourceUrl, "Source URL");
  }

  if (hasOwn(body, "locationLabel")) {
    payload.locationLabel = ensureOptionalString(body.locationLabel, "Location");
  } else if (!partial) {
    payload.locationLabel = "";
  }

  if (hasOwn(body, "isFeatured")) {
    payload.isFeatured = ensureBoolean(body.isFeatured, "Featured flag");
  } else if (!partial) {
    payload.isFeatured = true;
  }

  return payload;
};

export const getGoogleReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 4, 1), 12);
  const filters = req.query.featured === "true" || req.query.featured === "1" ? { isFeatured: true } : {};
  const reviews = await GoogleReview.find(filters).sort({ createdAt: -1 }).limit(limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

export const getGoogleReviewById = asyncHandler(async (req, res) => {
  const review = await GoogleReview.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

export const createGoogleReview = asyncHandler(async (req, res) => {
  const review = await GoogleReview.create(buildGoogleReviewPayload(req.body));

  res.status(201).json({
    success: true,
    message: "Review created successfully.",
    data: review,
  });
});

export const updateGoogleReview = asyncHandler(async (req, res) => {
  const payload = buildGoogleReviewPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const review = await GoogleReview.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    data: review,
  });
});

export const deleteGoogleReview = asyncHandler(async (req, res) => {
  const review = await GoogleReview.findByIdAndDelete(req.params.id);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});
