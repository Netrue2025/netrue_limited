import mongoose from "mongoose";

const validateMongoUri = (mongoUri) => {
  const sanitizedUri = mongoUri.trim();
  const protocolPattern = /^mongodb(\+srv)?:\/\//;

  if (!protocolPattern.test(sanitizedUri)) {
    throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://.");
  }

  const withoutProtocol = sanitizedUri.replace(protocolPattern, "");
  const authority = withoutProtocol.split("/")[0] || "";
  const atCount = (authority.match(/@/g) || []).length;

  if (atCount > 1) {
    throw new Error(
      "MONGO_URI appears to contain unescaped special characters in the username or password. URL-encode characters like @ as %40.",
    );
  }
};

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined. Add it to your environment variables.");
  }

  validateMongoUri(MONGO_URI);

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
};

export default connectDB;
