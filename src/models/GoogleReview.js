import mongoose from "mongoose";

const googleReviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: [true, "Reviewer name is required."],
      trim: true,
      maxlength: 120,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required."],
      trim: true,
      maxlength: 2000,
    },
    sourceUrl: {
      type: String,
      required: [true, "Source URL is required."],
      trim: true,
    },
    locationLabel: {
      type: String,
      default: "",
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

googleReviewSchema.index({ isFeatured: 1, createdAt: -1 });

const GoogleReview = mongoose.model("GoogleReview", googleReviewSchema);

export default GoogleReview;
