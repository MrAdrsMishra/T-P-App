import mongoose from "mongoose";

const ScoringProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    applicableScope: {
      type: { type: String },
      id: { type: String },
    },
    weights: [
      {
        metricId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Metric",
          required: true,
        },
        weight: {
          type: Number, // Percentage weight e.g. 25 for 25%
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const ScoringProfile = mongoose.model(
  "ScoringProfile",
  ScoringProfileSchema
);
