import mongoose, { mongo } from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topic: {
      type: String,
      index: true,
    },
    problemStatement: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    allocatedMark: {
      type: Number,
      required: true,
      default: 1,
    },
    options: [
      {
        optionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Option",
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    questionType: {
      type: String,
      enum: ["mcq", "coding", "essay", "short-answer"],
      default: "mcq",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
questionSchema.index({ testId: 1, subjectId: 1 });

export const Question = mongoose.model("Question", questionSchema);
