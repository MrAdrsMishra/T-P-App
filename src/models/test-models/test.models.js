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
  problems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  validTill: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);