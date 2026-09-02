import mongoose from "mongoose";

const StudentMetricPerformanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    academic: {
      course: { type: String, index: true },
      stream: { type: String, index: true },
      branch: { type: String, index: true },
      batch: { type: String, index: true },
    },
    metricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metric",
      required: true,
      index: true,
    },
    period: {
      type: {
        type: String,
        enum: ["ALL_TIME", "MONTHLY", "WEEKLY", "DAILY"],
        default: "ALL_TIME",
      },
      key: {
        type: String, // e.g. "ALL", "2026-09", "2026-W36"
        default: "ALL",
      },
    },
    questionsAttempted: {
      type: Number,
      default: 0,
    },
    questionsCorrect: {
      type: Number,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0, // percentage (0 - 100)
    },
    percentage: {
      type: Number,
      default: 0,
    },
    attemptsCount: {
      type: Number,
      default: 0,
    },
    tagBreakdown: [
      {
        tag: String,
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        status: { type: String, enum: ["WEAK", "AVERAGE", "STRONG"] },
      },
    ],
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index as specified in pre-check specs
StudentMetricPerformanceSchema.index(
  {
    studentId: 1,
    metricId: 1,
    "period.type": 1,
    "period.key": 1,
  },
  { unique: true }
);

StudentMetricPerformanceSchema.index({ "academic.branch": 1, "academic.batch": 1, metricId: 1 });

export const StudentMetricPerformance = mongoose.model(
  "StudentMetricPerformance",
  StudentMetricPerformanceSchema
);
