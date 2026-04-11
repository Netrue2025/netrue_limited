import Project from "../models/Project.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {
  ensureEnumValue,
  ensureOptionalString,
  ensureRequiredString,
  ensureStringArray,
  hasOwn,
  PROJECT_STAGES,
} from "../utils/validators.js";

const buildProjectPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (!partial || hasOwn(body, "title")) {
    payload.title = ensureRequiredString(body.title, "Title");
  }

  if (!partial || hasOwn(body, "description")) {
    payload.description = ensureRequiredString(body.description, "Description");
  }

  if (!partial || hasOwn(body, "category")) {
    payload.category = ensureRequiredString(body.category, "Category");
  }

  if (hasOwn(body, "stage")) {
    payload.stage = ensureEnumValue(body.stage, "Stage", PROJECT_STAGES);
  } else if (!partial) {
    payload.stage = "Discovery";
  }

  if (hasOwn(body, "outcome")) {
    payload.outcome = ensureOptionalString(body.outcome, "Outcome");
  } else if (!partial) {
    payload.outcome = "";
  }

  if (hasOwn(body, "techStack")) {
    payload.techStack = ensureStringArray(body.techStack, "Tech stack");
  } else if (!partial) {
    payload.techStack = [];
  }

  if (hasOwn(body, "image")) {
    payload.image = ensureOptionalString(body.image, "Image");
  } else if (!partial) {
    payload.image = "";
  }

  if (hasOwn(body, "images")) {
    payload.images = ensureStringArray(body.images, "Images");
  } else if (hasOwn(payload, "image")) {
    payload.images = payload.image ? [payload.image] : [];
  } else if (!partial) {
    payload.images = [];
  }

  return payload;
};

export const getProjects = asyncHandler(async (_req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = buildProjectPayload(req.body);
  const project = await Project.create(payload);

  res.status(201).json({
    success: true,
    message: "Project created successfully.",
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = buildProjectPayload(req.body, { partial: true });

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  res.status(200).json({
    success: true,
    message: "Project updated successfully.",
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  res.status(200).json({
    success: true,
    message: "Project deleted successfully.",
  });
});
