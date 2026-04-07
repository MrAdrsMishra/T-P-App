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
  testScore: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number,
    default: 0,
  },
  attemptCount:{
    type:Number,
    default:0
  },
  attemptDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "evaluated"],
    default: "pending",
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
  subjectScores:[
    {
      subjectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subject'  
      },
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
  ]
}, { timestamps: true });

// Add indexes to optimize queries
testAttemptSchema.index({ studentId: 1, testId: 1 });
testAttemptSchema.index({ studentId: 1, attemptDate: -1 });
testAttemptSchema.index({ testId: 1, attemptDate: -1 });

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);


