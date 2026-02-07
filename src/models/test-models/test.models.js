import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  forBranch: [{
    type: String,
    required: true,
    enum: ["AIML", "CSE", "EC", "EX", "DS", "CY", "AIDS", "BS"],
    index: true,
  }],
  forBatch: {
    type: String,
    default: () => new Date().getFullYear().toString(),
  },
  duration: {
    type: Number,
    required: true,
    default: 30,
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 20,
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  validTill: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["ONGOING", "ENDED", "UPCOMING"],
    default: "UPCOMING",
  },
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);