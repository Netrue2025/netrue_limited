import { Router } from "express";

import {
  createPublication,
  deletePublication,
  getPublicationById,
  getPublications,
  updatePublication,
} from "../controllers/publicationController.js";

const router = Router();

router.route("/").get(getPublications).post(createPublication);
router.route("/:id").get(getPublicationById).put(updatePublication).delete(deletePublication);

export default router;
