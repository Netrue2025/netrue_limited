import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required."],
      trim: true,
      maxlength: 160,
    },
    logo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    website: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    taxId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    receiptNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
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

companyProfileSchema.index({ isActive: 1, createdAt: -1 });

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);

export default CompanyProfile;
