import mongoose from "mongoose";

const MetricSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Metric name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Metric slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metric",
      default: null,
      index: true,
    },
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metric",
      },
    ],
    type: {
      type: String,
      enum: ["DOMAIN", "CATEGORY", "SUB_CATEGORY", "TOPIC", "SKILL"],
      required: [true, "Metric type is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

MetricSchema.index({ ancestors: 1, isActive: 1 });
MetricSchema.index({ parentId: 1 });

export const Metric = mongoose.model("Metric", MetricSchema);
