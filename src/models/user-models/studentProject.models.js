import mongoose, { mongo } from "mongoose";

const studentProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectLink: {
      type: String,
      trim: true,
    },
    projectDesc: {
      type: String,
      trim: true,
    },
    ownerStudentId: {
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      name: {
        type: String,
      },
    },
    projectStatus: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    dateStarted: {
      type: Date,
      default: Date.now,
    },
    dateCompleted: {
      type: Date,
    },
    technologies: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const StudentProject = mongoose.model(
  "StudentProject",
  studentProjectSchema
);
