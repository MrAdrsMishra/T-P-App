import mongoose from "mongoose";

const CodingRankingsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    branch: {
      type: String,
      default: "N/A",
      index: true,
    },
    batch: {
      type: String,
      default: null,
      index: true,
    },
    globalRank: {
      type: Number,
      default: 0,
      index: true,
    },
    branchRank: {
      type: Number,
      default: 0,
      index: true,
    },
    batchRank: {
      type: Number,
      default: 0,
      index: true,
    },
    tierRank: {
      type: Number,
      default: 0,
    },
    subjectRanks: {
      type: Map,
      of: Number,
      default: {},
    },
    categoryRanks: {
      type: Map,
      of: Number,
      default: {},
    },
    score: {
      type: Number,
      default: 0,
      index: true, // For sorting leaderboards
    },
    accuracyScore: {
      type: Number,
      default: 0,
    },
    speedScore: {
      type: Number,
      default: 0,
    },
    consistencyScore: {
      type: Number,
      default: 0,
    },
    challengeScore: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: String,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes for leaderboard queries
CodingRankingsSchema.index({ score: -1, globalRank: 1 });
CodingRankingsSchema.index({ branch: 1, score: -1 });
CodingRankingsSchema.index({ batch: 1, score: -1 });

export const CodingRankings = mongoose.model("CodingRankings", CodingRankingsSchema);
