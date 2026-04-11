import asyncHandler from "../utils/asyncHandler.js";

export const getHealthStatus = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy.",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
