import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import publicationRoutes from "./src/routes/publicationRoutes.js";
import shopRoutes from "./src/routes/shopRoutes.js";
import softwareRoutes from "./src/routes/softwareRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://netrue.io",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
app.use("/api/publications", publicationRoutes);
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
