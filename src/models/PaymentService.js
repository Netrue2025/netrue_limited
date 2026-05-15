import mongoose from "mongoose";

const paymentServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required."],
      trim: true,
      maxlength: 140,
    },
    code: {
      type: String,
      required: [true, "Service code is required."],
      trim: true,
      lowercase: true,
      maxlength: 90,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 600,
    },
    suggestedAmount: {
      type: Number,
      default: 0,
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

paymentServiceSchema.index({ isActive: 1, createdAt: -1 });

const PaymentService = mongoose.model("PaymentService", paymentServiceSchema);

export default PaymentService;
