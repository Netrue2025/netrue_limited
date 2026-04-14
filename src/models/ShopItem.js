import mongoose from "mongoose";

const shopItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: 160,
    },
    type: {
      type: String,
      required: [true, "Type is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    pricingModel: {
      type: String,
      enum: {
        values: ["Free", "Paid"],
        message: "Pricing model must be Free or Paid.",
      },
      default: "Paid",
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative."],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    fileAsset: {
      type: String,
      default: "",
      trim: true,
    },
    fileAssetName: {
      type: String,
      default: "",
      trim: true,
    },
    purchaseLink: {
      type: String,
      default: "",
      trim: true,
    },
    previewLink: {
      type: String,
      default: "",
      trim: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const ShopItem = mongoose.model("ShopItem", shopItemSchema);

export default ShopItem;
