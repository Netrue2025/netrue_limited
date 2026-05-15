import mongoose from "mongoose";

const servicePaymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentService",
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required."],
      trim: true,
      maxlength: 160,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true,
      maxlength: 140,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required."],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: 1,
    },
    paymentType: {
      type: String,
      enum: ["full", "part"],
      default: "full",
    },
    expectedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    paystackReference: {
      type: String,
      required: [true, "Paystack reference is required."],
      trim: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    companySnapshot: {
      companyName: { type: String, default: "" },
      logo: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      website: { type: String, default: "" },
      taxId: { type: String, default: "" },
      receiptNote: { type: String, default: "" },
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

servicePaymentSchema.index({ createdAt: -1 });
servicePaymentSchema.index({ customerEmail: 1, createdAt: -1 });

const ServicePayment = mongoose.model("ServicePayment", servicePaymentSchema);

export default ServicePayment;
