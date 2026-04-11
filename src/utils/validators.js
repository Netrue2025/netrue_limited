import ApiError from "./apiError.js";

export const PRODUCT_CATEGORIES = ["AI", "IoT", "Agritech", "Software"];
export const PRODUCT_STATUSES = ["Prototype", "Pilot", "Available", "Pre-order"];
export const PROJECT_STAGES = ["Discovery", "Pilot", "Rollout", "Production"];

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export const ensureRequiredString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${fieldName} is required.`);
  }

  return value.trim();
};

export const ensureOptionalString = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} must be a string.`);
  }

  return value.trim();
};

export const ensureStringArray = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => ensureRequiredString(item, `${fieldName}[${index}]`));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new ApiError(400, `${fieldName} must be an array of strings or a comma-separated string.`);
};

export const ensureBoolean = (value, fieldName) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  throw new ApiError(400, `${fieldName} must be a boolean.`);
};

export const ensureNumber = (value, fieldName) => {
  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(parsed)) {
    throw new ApiError(400, `${fieldName} must be a valid number.`);
  }

  return parsed;
};

export const ensureEmail = (value) => {
  const email = ensureRequiredString(value, "Email").toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new ApiError(400, "Email address is invalid.");
  }

  return email;
};

export const ensureEnumValue = (value, fieldName, allowedValues) => {
  const normalized = ensureRequiredString(value, fieldName);

  if (!allowedValues.includes(normalized)) {
    throw new ApiError(400, `${fieldName} must be one of: ${allowedValues.join(", ")}.`);
  }

  return normalized;
};
