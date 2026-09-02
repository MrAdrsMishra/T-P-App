import mongoose from "mongoose";

const RankingSnapshotSchema = new mongoose.Schema(
  {
    metricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metric",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    scope: {
      type: {
        type: String,
        enum: ["GLOBAL", "COURSE", "STREAM", "BRANCH", "BATCH", "CUSTOM"],
        required: true,
      },
      id: {
        type: String, // e.g. "ALL", "B.Tech", "CSE", "CSE-AIML", "2022-2026"
        required: true,
      },
    },
    period: {
      type: {
        type: String,
        enum: ["ALL_TIME", "MONTHLY", "WEEKLY", "DAILY"],
        default: "ALL_TIME",
      },
      key: {
        type: String,
        default: "ALL",
      },
    },
    score: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    totalParticipants: {
      type: Number,
      required: true,
    },
    tieStrategy: {
      type: String,
      enum: ["COMPETITION", "DENSE"],
      default: "COMPETITION",
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// High performance index for fast leaderboard queries
RankingSnapshotSchema.index({
  metricId: 1,
  "scope.type": 1,
  "scope.id": 1,
  "period.type": 1,
  "period.key": 1,
  rank: 1,
});

export const RankingSnapshot = mongoose.model(
  "RankingSnapshot",
  RankingSnapshotSchema
);
