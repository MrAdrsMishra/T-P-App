import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  test_score: Number,
  time_taken: Number,
  submittedAt: { type: Date, default: Date.now }
});

// Add an index to optimize queries
testAttemptSchema.index({ student_id: 1, test_id: 1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
