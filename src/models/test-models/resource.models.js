import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  resourceTitle: {
    type: String,
    required: true,
    trim: true,
  },
  resourceDescription: {
    type: String,
  },
  resourceLink: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  batch: {
    type: String,
  },
  branch: [{
    type: String,
    enum: ["AIML", "CSE", "EC", "EX", "DS", "CY", "AIDS", "BS"],
  }],
  resourceCategory: {
    type: String,
    enum: ["hiring", "learning", "internship", "other"],
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  expiryDate: {
    type: Date,
  },
  tags: [{
    type: String,
  }],
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export const Resource = mongoose.model("Resource", resourceSchema);
