import express from "express";
import {
  createPublicationService,
  deletePublicationService,
  getPublicationServiceById,
  getPublicationServices,
  updatePublicationService
} from "../controllers/publicationServiceController.js";

const router = express.Router();

router.route("/").get(getPublicationServices).post(createPublicationService);
router.route("/:id").get(getPublicationServiceById).put(updatePublicationService).delete(deletePublicationService);

export default router;
