import mongoose from "mongoose";

const shopCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

shopCategorySchema.index({ isActive: 1, createdAt: -1 });

const ShopCategory = mongoose.model("ShopCategory", shopCategorySchema);

export default ShopCategory;
