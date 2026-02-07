import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  optionValue: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
}, { timestamps: true });

export const Option = mongoose.model("Option", optionSchema);
