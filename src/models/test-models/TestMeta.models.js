import mongoose from "mongoose";

const TestMetaSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  averageScore: {
    type: Number,
    required: true,
    default: 0,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  problems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  averageTimeTaken: {
    type: Number,
    required: true,
    default: 0,
  },
  highestScore: {
    type: Number,
    required: true,
    default: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 0,
  },
  totalParticipents: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ["ONGOING", "ENDED", "UPCOMING"],
    default: "UPCOMING",
  },
});
export const TestMeta = mongoose.model("TestMeta", TestMetaSchema);
