import mongoose from "mongoose";

const subjectRankHistorySchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectScore: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  percentile: {
    type: Number,
    required: true,
  },
  totalParticipants: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Composite index
subjectRankHistorySchema.index({ testId: 1, subjectId: 1, studentId: 1 }, { unique: true });

export const SubjectRankHistory = mongoose.model("SubjectRankHistory", subjectRankHistorySchema);
