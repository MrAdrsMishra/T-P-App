import mongoose from "mongoose";

const RankHistorySchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    rank: {
        type: Number,
        required: true,
    },
    percentile: {
        type: Number,
        required: true,
    },
    totalParticipants: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Composite unique index
RankHistorySchema.index({ testId: 1, studentId: 1 }, { unique: true });

export const RankHistory = mongoose.model('RankHistory', RankHistorySchema);