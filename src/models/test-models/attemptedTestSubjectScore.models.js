import mongoose from "mongoose";

const attemptedTestSubjectScoreSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestAttempt",
    required: true,
  },
  subjectScore: {
    type: Number,
    required: true,
    default: 0,
  },
  subjectMaxMarks: {
    type: Number,
    required: true,
    default: 25,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Composite index for efficient queries
attemptedTestSubjectScoreSchema.index({ testId: 1, studentId: 1, subjectId: 1 });

export const AttemptedTestSubjectScore = mongoose.model("AttemptedTestSubjectScore", attemptedTestSubjectScoreSchema);
