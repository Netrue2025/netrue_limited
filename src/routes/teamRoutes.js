import { Router } from "express";

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMemberById,
  getTeamMembers,
  updateTeamMember,
} from "../controllers/teamController.js";

const router = Router();

router.route("/").get(getTeamMembers).post(createTeamMember);
router.route("/:id").get(getTeamMemberById).put(updateTeamMember).delete(deleteTeamMember);

export default router;
