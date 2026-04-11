import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    stage: {
      type: String,
      enum: {
        values: ["Discovery", "Pilot", "Rollout", "Production"],
        message: "Stage must be one of Discovery, Pilot, Rollout, or Production.",
      },
      default: "Discovery",
    },
    outcome: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
