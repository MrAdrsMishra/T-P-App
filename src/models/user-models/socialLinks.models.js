import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true,
  },
  linkedin: {
    type: String,
    trim: true,
  },
  github: {
    type: String,
    trim: true,
  },
  gfg: {
    type: String,
    trim: true,
  },
  leetcode: {
    type: String,
    trim: true,
  },
  hackerrank: {
    type: String,
    trim: true,
  },
  portfolio: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

export const SocialLinks = mongoose.model("SocialLinks", socialLinksSchema);
