import express from "express";
import {
  createCompanyProfile,
  deleteCompanyProfile,
  getCompanyProfileById,
  getCompanyProfiles,
  updateCompanyProfile,
} from "../controllers/companyProfileController.js";

const router = express.Router();

router.route("/").get(getCompanyProfiles).post(createCompanyProfile);
router.route("/:id").get(getCompanyProfileById).put(updateCompanyProfile).delete(deleteCompanyProfile);

export default router;
