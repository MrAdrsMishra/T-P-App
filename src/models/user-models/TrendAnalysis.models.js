import mongoose from "mongoose";

const TrendAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    metrics: {
      accuracy: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      questionsAttempted: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 }, // in minutes
      totalScore: { type: Number, default: 0 },
    },
    subjectBreakdown: {
      type: Map,
      of: new mongoose.Schema(
        {
          accuracy: { type: Number, default: 0 },
          questionsAttempted: { type: Number, default: 0 },
          timeSpent: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    categoryBreakdown: {
      type: Map,
      of: new mongoose.Schema(
        {
          accuracy: { type: Number, default: 0 },
          questionsAttempted: { type: Number, default: 0 },
          timeSpent: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    engagementScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for unique student metrics per day
TrendAnalysisSchema.index({ studentId: 1, dateString: 1 }, { unique: true });

// TTL index to auto-expire trend records older than 90 days (7776000 seconds)
TrendAnalysisSchema.index({ date: 1 }, { expireAfterSeconds: 7776000 });

export const TrendAnalysis = mongoose.model("TrendAnalysis", TrendAnalysisSchema);
