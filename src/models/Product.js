import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: {
        values: ["AI", "IoT", "Agritech", "Software"],
        message: "Category must be one of AI, IoT, Agritech, or Software.",
      },
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Prototype", "Pilot", "Available", "Pre-order"],
        message: "Status must be one of Prototype, Pilot, Available, or Pre-order.",
      },
      default: "Available",
    },
    specs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
