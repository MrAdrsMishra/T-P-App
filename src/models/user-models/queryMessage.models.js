import mongoose from "mongoose";

const queryMessageSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  queryTitle: {
    type: String,
    required: true,
    trim: true,
  },
  queryDescription: {
    type: String,
    required: true,
  },
  queryCategory: {
    type: String,
    enum: ["technical", "placement", "general", "other"],
    default: "general",
  },
  queryStatus: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  resolution: {
    type: String,
  },
  queryDate: {
    type: Date,
    default: Date.now,
  },
  resolvedDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
}, { timestamps: true });

export const QueryMessage = mongoose.model("QueryMessage", queryMessageSchema);
