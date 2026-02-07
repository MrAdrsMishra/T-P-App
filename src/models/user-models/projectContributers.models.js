import mongoose from "mongoose";

const projectContributorsSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentProject",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "contributor"],
    default: "contributor",
    required: true,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Composite unique index for projectId and studentId
projectContributorsSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const ProjectContributors = mongoose.model("ProjectContributors", projectContributorsSchema);
