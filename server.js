import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import googleReviewRoutes from "./src/routes/googleReviewRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import paystackRoutes from "./src/routes/paystackRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import publicationRoutes from "./src/routes/publicationRoutes.js";
import publicationServiceRoutes from "./src/routes/publicationServiceRoutes.js";
import publicationSubmissionRoutes from "./src/routes/publicationSubmissionRoutes.js";
import shopRoutes from "./src/routes/shopRoutes.js";
import shopCategoryRoutes from "./src/routes/shopCategoryRoutes.js";
import softwareRoutes from "./src/routes/softwareRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

function normalizeOrigin(value) {
  return value.trim().replace(/\/+$/, "");
}

function parseAllowedOrigins() {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URLS,
    process.env.ALLOWED_ORIGINS
  ]
    .filter(Boolean)
    .flatMap((entry) => entry.split(","))
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);

  return [...new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://netrue.io",
    "https://www.netrue.io",
    ...configuredOrigins
  ])];
}

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;

      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy does not allow access from this origin."));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Netrue Limited API is running.",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/software", softwareRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/shop-categories", shopCategoryRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/publication-services", publicationServiceRoutes);
app.use("/api/publication-submissions", publicationSubmissionRoutes);
app.use("/api/google-reviews", googleReviewRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown("unhandledRejection");
});

startServer();
