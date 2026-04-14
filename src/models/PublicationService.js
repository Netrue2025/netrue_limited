import mongoose from "mongoose";

const publicationServiceSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: [true, "Service type is required."],
      enum: {
        values: ["publication_submission", "proofreading", "full_writing_publishing"],
        message: "Service type is invalid.",
      },
      unique: true,
    },
    label: {
      type: String,
      required: [true, "Label is required."],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    priceUsd: {
      type: Number,
      required: [true, "USD price is required."],
      min: 0,
    },
    priceNgn: {
      type: Number,
      required: [true, "NGN price is required."],
      min: 0,
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

publicationServiceSchema.index({ isActive: 1, createdAt: -1 });

const PublicationService = mongoose.model("PublicationService", publicationServiceSchema);

export default PublicationService;
