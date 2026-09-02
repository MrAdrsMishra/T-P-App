import mongoose from "mongoose";

const testSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    subjectName: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      enum: ["MCQ", "Coding", "Essay", "Descriptive", "Hybrid"],
      default: "MCQ",
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }, // in seconds
        scoreObtained: { type: Number, default: 0 },
        maxMarks: { type: Number, default: 0 },
      },
    ],
    sessionMetadata: {
      startTime: { type: Date },
      endTime: { type: Date },
      duration: { type: Number, default: 0 }, // in minutes
      totalQuestions: { type: Number, default: 0 },
      totalCorrect: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      maxPossibleScore: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

testSessionSchema.index({ studentId: 1, date: -1 });
testSessionSchema.index({ studentId: 1, category: 1, date: -1 });

export const PracticeSession = mongoose.model("TestSession", testSessionSchema);
