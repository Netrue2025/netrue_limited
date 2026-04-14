import mongoose from "mongoose";
import { PUBLICATION_SERVICE_TYPES, PUBLICATION_SUBMISSION_STATUSES } from "../utils/validators.js";

const publicationSubmissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: 200,
    },
    authorName: {
      type: String,
      required: [true, "Author name is required."],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
    },
    abstract: {
      type: String,
      required: [true, "Abstract is required."],
      trim: true,
      maxlength: 5000,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: {
        values: PUBLICATION_SERVICE_TYPES,
        message: "Service type is invalid.",
      },
      required: [true, "Service type is required."],
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
    paystackReference: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PUBLICATION_SUBMISSION_STATUSES,
        message: "Payment status is invalid.",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

publicationSubmissionSchema.index({ createdAt: -1 });
publicationSubmissionSchema.index({ paymentStatus: 1, createdAt: -1 });

const PublicationSubmission = mongoose.model("PublicationSubmission", publicationSubmissionSchema);

export default PublicationSubmission;
