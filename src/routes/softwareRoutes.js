import { Router } from "express";

import {
  createSoftware,
  deleteSoftware,
  getSoftware,
  getSoftwareById,
  updateSoftware,
} from "../controllers/softwareController.js";

const router = Router();

router.route("/").get(getSoftware).post(createSoftware);
router.route("/:id").get(getSoftwareById).put(updateSoftware).delete(deleteSoftware);

export default router;
