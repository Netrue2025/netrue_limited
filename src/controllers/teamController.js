import TeamMember from "../models/TeamMember.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureEnumValue,
  ensureOptionalString,
  ensureRequiredString,
  hasOwn,
  SOCIAL_PLATFORMS,
} from "../utils/validators.js";

const buildTeamMemberPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "name")) {
    payload.name = ensureRequiredString(body.name, "Name");
  }

  if (!partial || hasOwn(body, "position")) {
    payload.position = ensureRequiredString(body.position, "Position");
  }

  if (!partial || hasOwn(body, "note")) {
    payload.note = ensureRequiredString(body.note, "Note");
  }

  if (hasOwn(body, "image")) {
    payload.image = ensureOptionalString(body.image, "Image");
  } else if (!partial) {
    payload.image = "";
  }

  if (!partial || hasOwn(body, "socialPlatform")) {
    payload.socialPlatform = ensureEnumValue(body.socialPlatform, "Social platform", SOCIAL_PLATFORMS);
  }

  if (!partial || hasOwn(body, "socialHandle")) {
    payload.socialHandle = ensureRequiredString(body.socialHandle, "Social handle");
  }

  if (!partial || hasOwn(body, "socialUrl")) {
    payload.socialUrl = ensureRequiredString(body.socialUrl, "Social URL");
  }

  return payload;
};

export const getTeamMembers = asyncHandler(async (_req, res) => {
  const teamMembers = await TeamMember.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: teamMembers.length,
    data: teamMembers,
  });
});

export const getTeamMemberById = asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);

  if (!teamMember) {
    throw new ApiError(404, "Team member not found.");
  }

  res.status(200).json({
    success: true,
    data: teamMember,
  });
});

export const createTeamMember = asyncHandler(async (req, res) => {
  const payload = buildTeamMemberPayload(req.body);
  const teamMember = await TeamMember.create(payload);

  res.status(201).json({
    success: true,
    message: "Team member created successfully.",
    data: teamMember,
  });
});

export const updateTeamMember = asyncHandler(async (req, res) => {
  const payload = buildTeamMemberPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const teamMember = await TeamMember.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!teamMember) {
    throw new ApiError(404, "Team member not found.");
  }

  res.status(200).json({
    success: true,
    message: "Team member updated successfully.",
    data: teamMember,
  });
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findByIdAndDelete(req.params.id);

  if (!teamMember) {
    throw new ApiError(404, "Team member not found.");
  }

  res.status(200).json({
    success: true,
    message: "Team member deleted successfully.",
  });
});
