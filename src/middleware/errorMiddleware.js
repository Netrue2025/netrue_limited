import ApiError from "../utils/apiError.js";

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error.name === "CastError") {
    return {
      statusCode: 400,
      message: `Invalid value provided for ${error.path}.`,
    };
  }

  if (error.name === "ValidationError") {
    return {
      statusCode: 400,
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(" "),
    };
  }

  if (error.code === 11000) {
    return {
      statusCode: 409,
      message: "A record with this value already exists.",
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || "Internal server error.",
  };
};

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const normalizedError = normalizeError(error);

  return res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
