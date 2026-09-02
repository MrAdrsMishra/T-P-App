import mongoose, { mongo } from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    metricAncestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metric",
        index: true,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    problemStatement: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    metrics: [
      {
        metricId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Metric",
          required: true,
        },
        weight: {
          type: Number,
          default: 1.0,
        },
      },
    ],
    allocatedMark: {
      type: Number,
      required: true,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    options: [
      {
        optionText: String,
        isCorrect: {
          type: Boolean,
          default: false,
        },
        explanation: String,
      },
    ],
    codingConfig: {
      supportedLanguages: [String],
      timeLimitMs: Number,
      memoryLimitMb: Number,
    },
    questionType: {
      type: String,
      enum: ["mcq", "coding", "essay", "short-answer", "audio_spoken"],
      default: "mcq",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
questionSchema.index({ testId: 1, subjectId: 1 });
questionSchema.index({ "metrics.metricId": 1 });
questionSchema.index({ tags: 1 });

export const Question = mongoose.model("Question", questionSchema);
