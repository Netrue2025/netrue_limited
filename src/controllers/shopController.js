import ShopItem from "../models/ShopItem.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureEnumValue,
  ensureNumber,
  ensureOptionalString,
  ensureRequiredString,
  ensureStringArray,
  hasOwn,
  PRICING_MODELS,
  SHOP_ITEM_TYPES,
} from "../utils/validators.js";

const buildShopItemPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "type")) {
    payload.type = ensureEnumValue(body.type, "Type", SHOP_ITEM_TYPES);
  }

  if (!partial || hasOwn(body, "description")) {
    payload.description = ensureRequiredString(body.description, "Description");
  }

  if (hasOwn(body, "pricingModel")) {
    payload.pricingModel = ensureEnumValue(body.pricingModel, "Pricing model", PRICING_MODELS);
  } else if (!partial) {
    payload.pricingModel = "Paid";
  }

  if (hasOwn(body, "price")) {
    payload.price = ensureNumber(body.price, "Price");
  } else if (!partial) {
    payload.price = 0;
  }

  if (hasOwn(body, "tags")) {
    payload.tags = ensureStringArray(body.tags, "Tags");
  } else if (!partial) {
    payload.tags = [];
  }

  if (hasOwn(body, "fileAsset")) {
    payload.fileAsset = ensureOptionalString(body.fileAsset, "Digital file");
  } else if (!partial) {
    payload.fileAsset = "";
  }

  if (hasOwn(body, "fileAssetName")) {
    payload.fileAssetName = ensureOptionalString(body.fileAssetName, "Digital file name");
  } else if (!partial) {
    payload.fileAssetName = "";
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

  const resolvedPricingModel = hasOwn(payload, "pricingModel") ? payload.pricingModel : undefined;
  const resolvedPrice = hasOwn(payload, "price") ? payload.price : undefined;

  if (!partial) {
    if (payload.pricingModel === "Free") {
      payload.price = 0;
    } else if (payload.price <= 0) {
      throw new ApiError(400, "Price must be greater than 0 when the shop item is paid.");
    }
  } else if (resolvedPricingModel === "Free") {
    payload.price = 0;
  } else if (resolvedPricingModel === "Paid" && resolvedPrice !== undefined && resolvedPrice <= 0) {
    throw new ApiError(400, "Price must be greater than 0 when the shop item is paid.");
  }

  return payload;
};

export const getShopItems = asyncHandler(async (_req, res) => {
  const shopItems = await ShopItem.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: shopItems.length,
    data: shopItems,
  });
});

export const getShopItemById = asyncHandler(async (req, res) => {
  const shopItem = await ShopItem.findById(req.params.id);

  if (!shopItem) {
    throw new ApiError(404, "Shop item not found.");
  }

  res.status(200).json({
    success: true,
    data: shopItem,
  });
});

export const createShopItem = asyncHandler(async (req, res) => {
  const payload = buildShopItemPayload(req.body);
  const shopItem = await ShopItem.create(payload);

  res.status(201).json({
    success: true,
    message: "Shop item created successfully.",
    data: shopItem,
  });
});

export const updateShopItem = asyncHandler(async (req, res) => {
  const existingShopItem = await ShopItem.findById(req.params.id);

  if (!existingShopItem) {
    throw new ApiError(404, "Shop item not found.");
  }

  const payload = buildShopItemPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const nextPricingModel = hasOwn(payload, "pricingModel") ? payload.pricingModel : existingShopItem.pricingModel;
  const nextPrice = hasOwn(payload, "price") ? payload.price : existingShopItem.price;

  if (nextPricingModel === "Free") {
    payload.price = 0;
  } else if (nextPrice <= 0) {
    throw new ApiError(400, "Price must be greater than 0 when the shop item is paid.");
  }

  const shopItem = await ShopItem.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Shop item updated successfully.",
    data: shopItem,
  });
});

export const deleteShopItem = asyncHandler(async (req, res) => {
  const shopItem = await ShopItem.findByIdAndDelete(req.params.id);

  if (!shopItem) {
    throw new ApiError(404, "Shop item not found.");
  }

  res.status(200).json({
    success: true,
    message: "Shop item deleted successfully.",
  });
});
