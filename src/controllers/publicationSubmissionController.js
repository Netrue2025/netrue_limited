import PublicationSubmission from "../models/PublicationSubmission.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { sendMail } from "../utils/mailer.js";
import { verifyPaystackTransaction } from "../utils/paystack.js";
import {
  ensureEmail,
  ensureEnumValue,
  ensureNumber,
  ensureOptionalString,
  ensureRequiredString,
  hasOwn,
  PUBLICATION_SERVICE_TYPES,
  PUBLICATION_SUBMISSION_STATUSES,
} from "../utils/validators.js";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination.js";

const SERVICE_PRICING = {
  publication_submission: { priceUsd: 80, priceNgn: 80 * 1480 },
  proofreading: { priceUsd: 25, priceNgn: 25 * 1480 },
  full_writing_publishing: { priceUsd: 150, priceNgn: 150 * 1480 },
};

const buildPublicationSubmissionPayload = async (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "authorName")) {
    payload.authorName = ensureRequiredString(body.authorName, "Author name");
  }

  if (!partial || hasOwn(body, "email")) {
    payload.email = ensureEmail(body.email);
  }

  if (!partial || hasOwn(body, "abstract")) {
    payload.abstract = ensureRequiredString(body.abstract, "Abstract");
  }

  if (!partial || hasOwn(body, "category")) {
    payload.category = ensureRequiredString(body.category, "Category");
  }

  if (!partial || hasOwn(body, "serviceType")) {
    payload.serviceType = ensureEnumValue(body.serviceType, "Service type", PUBLICATION_SERVICE_TYPES);
    payload.priceUsd = SERVICE_PRICING[payload.serviceType].priceUsd;
    payload.priceNgn = SERVICE_PRICING[payload.serviceType].priceNgn;
  }

  if (hasOwn(body, "fileUrl")) {
    payload.fileUrl = ensureOptionalString(body.fileUrl, "File upload");
  } else if (!partial) {
    payload.fileUrl = "";
  }

  if (hasOwn(body, "fileName")) {
    payload.fileName = ensureOptionalString(body.fileName, "File name");
  } else if (!partial) {
    payload.fileName = "";
  }

  if (hasOwn(body, "paystackReference")) {
    payload.paystackReference = ensureOptionalString(body.paystackReference, "Paystack reference");
  } else if (!partial) {
    payload.paystackReference = "";
  }

  if (hasOwn(body, "paymentStatus")) {
    payload.paymentStatus = ensureEnumValue(body.paymentStatus, "Payment status", PUBLICATION_SUBMISSION_STATUSES);
  } else if (!partial) {
    payload.paymentStatus = "pending";
  }

  return payload;
};

export const getPublicationSubmissions = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.paymentStatus) {
    filters.paymentStatus = req.query.paymentStatus;
  }

  const { limit, page, skip } = resolvePagination(req.query, { defaultLimit: 8 });
  const [submissions, total] = await Promise.all([
    PublicationSubmission.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PublicationSubmission.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions,
    pagination: buildPaginationMeta({ page, limit, total }),
  });
});

export const getPublicationSubmissionById = asyncHandler(async (req, res) => {
  const submission = await PublicationSubmission.findById(req.params.id);

  if (!submission) {
    throw new ApiError(404, "Publication submission not found.");
  }

  res.status(200).json({
    success: true,
    data: submission,
  });
});

export const createPublicationSubmission = asyncHandler(async (req, res) => {
  const payload = await buildPublicationSubmissionPayload(req.body);

  if (!payload.paystackReference) {
    throw new ApiError(400, "Payment reference is required before submitting.");
  }

  try {
    const transaction = await verifyPaystackTransaction(payload.paystackReference);
    if (transaction.status === "success") {
      payload.paymentStatus = "paid";
    }
  } catch (error) {
    throw new ApiError(error.statusCode || 400, error.message || "Unable to verify payment.");
  }

  const submission = await PublicationSubmission.create(payload);
  const recipient = process.env.PUBLICATION_RECIPIENT_EMAIL || "info@netrue.io";

  await sendMail({
    to: recipient,
    subject: `New publication submission: ${submission.title}`,
    text: `Title: ${submission.title}\nAuthor: ${submission.authorName}\nEmail: ${submission.email}\nCategory: ${submission.category}\nService: ${submission.serviceType}\nReference: ${submission.paystackReference}\n\n${submission.abstract}`,
    html: `
      <h2>New publication submission</h2>
      <p><strong>Title:</strong> ${submission.title}</p>
      <p><strong>Author:</strong> ${submission.authorName}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Category:</strong> ${submission.category}</p>
      <p><strong>Service:</strong> ${submission.serviceType}</p>
      <p><strong>Payment reference:</strong> ${submission.paystackReference}</p>
      <p><strong>Abstract:</strong></p>
      <p>${submission.abstract.replace(/\n/g, "<br />")}</p>
    `,
    attachments:
      submission.fileUrl && submission.fileName
        ? [
            {
              filename: submission.fileName,
              path: submission.fileUrl,
            },
          ]
        : [],
  });

  res.status(201).json({
    success: true,
    message: "Publication submission received successfully.",
    data: submission,
  });
});

export const updatePublicationSubmission = asyncHandler(async (req, res) => {
  const payload = await buildPublicationSubmissionPayload(req.body, { partial: true });

  if (hasOwn(req.body, "priceUsd")) {
    payload.priceUsd = ensureNumber(req.body.priceUsd, "USD price");
  }

  if (hasOwn(req.body, "priceNgn")) {
    payload.priceNgn = ensureNumber(req.body.priceNgn, "NGN price");
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const submission = await PublicationSubmission.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!submission) {
    throw new ApiError(404, "Publication submission not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication submission updated successfully.",
    data: submission,
  });
});

export const deletePublicationSubmission = asyncHandler(async (req, res) => {
  const submission = await PublicationSubmission.findByIdAndDelete(req.params.id);

  if (!submission) {
    throw new ApiError(404, "Publication submission not found.");
  }

  res.status(200).json({
    success: true,
    message: "Publication submission deleted successfully.",
  });
});
