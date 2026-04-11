import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema(
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
    authors: {
      type: [String],
      default: [],
    },
    publishedOn: {
      type: String,
      default: "",
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Publication = mongoose.model("Publication", publicationSchema);

export default Publication;
