import mongoose from 'mongoose';

const StudentStatsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true,
    },
    totalTests: {
        type: Number,
        required: true,
        default: 0,
    },
    avgScore: {
        type: Number,
        required: true,
        default: 0,
    },
    bestRank: {
        type: Number,
        required: true,
        default: 0,
    },
    Percentile: {
        type: Number,
        default: 0,
    },
    subjects: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        },
        avgScore: Number,
        bestRank: Number,
    }],
}, { timestamps: true });

export const StudentStats = mongoose.model('StudentStats', StudentStatsSchema);