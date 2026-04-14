import express from "express";
import {
  createGoogleReview,
  deleteGoogleReview,
  getGoogleReviewById,
  getGoogleReviews,
  updateGoogleReview,
} from "../controllers/googleReviewController.js";

const router = express.Router();

router.route("/").get(getGoogleReviews).post(createGoogleReview);
router.route("/:id").get(getGoogleReviewById).put(updateGoogleReview).delete(deleteGoogleReview);

export default router;
