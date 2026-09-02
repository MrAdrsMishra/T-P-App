import mongoose from "mongoose";

const AssessmentAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "submitted", "abandoned"],
      default: "in-progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

AssessmentAttemptSchema.index({ studentId: 1, assessmentId: 1 });

export const AssessmentAttempt = mongoose.model(
  "AssessmentAttempt",
  AssessmentAttemptSchema
);
