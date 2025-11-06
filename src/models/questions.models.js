import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  problemStatement: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    default: [],
  },
  correctOption: {
    type: String,
    required: true,
  },
  allocatedMark: {
    type: Number,
    required: true,
    default: 1,
  },
  subject: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);
