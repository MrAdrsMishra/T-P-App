import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  testCategory: {
    type: String,
    enum: ["MCQ", "Coding", "Essay", "Descriptive", "Hybrid"],
    default: "MCQ",
    index: true,
  },
  testScore: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number,
    default: 0,
  },
  attemptCount:{
    type:Number,
    default:1
  },
  attemptDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "evaluated"],
    default: "submitted",
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  wrongAnswers: {
    type: Number,
    default: 0,
  },
  skippedAnswers: {
    type: Number,
    default: 0,
  },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      category: { type: String, enum: ["MCQ", "Coding", "Essay", "Descriptive"], default: "MCQ" },
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: { type: Boolean, default: false },
      scoreObtained: { type: Number, default: 0 },
      maxMarks: { type: Number, default: 0 },
      timeTaken: { type: Number, default: 0 }, // in seconds
      difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" }
    }
  ],
  subjectScores:[
    {
      subjectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subject'  
      },
      subjectName: { type: String },
      scoreObtained:{
        type:Number,
        default:0
      },
      maxMarks:{
        type:Number,
        default:0
      },
      timeTaken:{
        type:Number,
        default:0
      }
    }
  ],
  categoryScores: {
    type: Map,
    of: new mongoose.Schema({
      scoreObtained: { type: Number, default: 0 },
      maxMarks: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }, { _id: false }),
    default: {}
  }
}, { timestamps: true });

// Add indexes to optimize queries
testAttemptSchema.index({ studentId: 1, testId: 1 });
testAttemptSchema.index({ studentId: 1, attemptDate: -1 });
testAttemptSchema.index({ testId: 1, attemptDate: -1 });

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);


