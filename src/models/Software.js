import mongoose from "mongoose";

const softwareSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      min: [0, "Price cannot be negative."],
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    downloadLink: {
      type: String,
      default: "",
      trim: true,
    },
    purchaseLink: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    pricingModel: {
      type: String,
      enum: ["Free", "Paid"],
      default: "Paid",
    },
  },
  {
    timestamps: true,
  },
);

const Software = mongoose.model("Software", softwareSchema);

export default Software;
