import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 120,
    },
    position: {
      type: String,
      required: [true, "Position is required."],
      trim: true,
      maxlength: 160,
    },
    note: {
      type: String,
      required: [true, "Note is required."],
      trim: true,
      maxlength: 1200,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    socialPlatform: {
      type: String,
      required: [true, "Social platform is required."],
      enum: {
        values: ["LinkedIn", "X", "Instagram", "Facebook", "Website"],
        message: "Social platform must be LinkedIn, X, Instagram, Facebook, or Website.",
      },
    },
    socialHandle: {
      type: String,
      required: [true, "Social handle is required."],
      trim: true,
      maxlength: 120,
    },
    socialUrl: {
      type: String,
      required: [true, "Social URL is required."],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
