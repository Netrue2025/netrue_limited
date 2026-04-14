import express from "express";
import {
  createPublicationSubmission,
  deletePublicationSubmission,
  getPublicationSubmissionById,
  getPublicationSubmissions,
  updatePublicationSubmission,
} from "../controllers/publicationSubmissionController.js";

const router = express.Router();

router.route("/").get(getPublicationSubmissions).post(createPublicationSubmission);
router.route("/:id").get(getPublicationSubmissionById).put(updatePublicationSubmission).delete(deletePublicationSubmission);

export default router;
