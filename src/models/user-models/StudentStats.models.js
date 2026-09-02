    import mongoose from 'mongoose';

    const StudentStatsSchema = new mongoose.Schema({
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            unique: true,
            index: true,
        },
        totalTests: {
            type: Number,
            required: true,
            default: 0,
        },
        totalAttempts: {
            type: Number,
            default: 0,
        },
        totalTimeSpent: {
            type: Number, // in minutes
            default: 0,
        },
        avgScore: {
            type: Number,
            required: true,
            default: 0,
        },
        overallAccuracy: {
            type: Number,
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
        streakInfo: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastUpdated: { type: Date, default: Date.now },
        },
        ranking: {
            globalRank: { type: Number, default: 0 },
            courseRank: { type: Number, default: 0 },
            streamRank: { type: Number, default: 0 },
            branchRank: { type: Number, default: 0 },
            batchRank: { type: Number, default: 0 },
            tierRank: { type: Number, default: 0 },
            subjectRanks: { type: Map, of: Number, default: {} },
            categoryRanks: { type: Map, of: Number, default: {} },
            subCategoryRanks: { type: Map, of: Number, default: {} },
        },
        subjects: [{
            subjectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
            },
            subjectName: { type: String },
            avgScore: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            attempts: { type: Number, default: 0 },
            timeSpent: { type: Number, default: 0 },
            bestRank: { type: Number, default: 0 },
        }],
        categoryStats: {
            type: Map,
            of: new mongoose.Schema({
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0 },
                score: { type: Number, default: 0 },
                timeSpent: { type: Number, default: 0 }
            }, { _id: false }),
            default: {}
        },
        subCategoryStats: {
            type: Map,
            of: new mongoose.Schema({
                category: { type: String },
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0 },
                score: { type: Number, default: 0 },
                timeSpent: { type: Number, default: 0 }
            }, { _id: false }),
            default: {}
        },
        tagStats: {
            type: Map,
            of: new mongoose.Schema({
                category: { type: String },
                subCategory: { type: String },
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0 },
                status: { type: String, enum: ["weak", "average", "strong"], default: "average" }
            }, { _id: false }),
            default: {}
        },
        difficultyStats: {
            easy: { attempts: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, accuracy: { type: Number, default: 0 } },
            medium: { attempts: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, accuracy: { type: Number, default: 0 } },
            hard: { attempts: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, accuracy: { type: Number, default: 0 } },
        },
        performanceTrends: {
            daily7d: [{ date: String, accuracy: Number, score: Number, questionsCount: Number }],
            daily30d: [{ date: String, accuracy: Number, score: Number, questionsCount: Number }],
            daily90d: [{ date: String, accuracy: Number, score: Number, questionsCount: Number }],
        },
        consistencyScore: {
            type: Number, // 0 - 100 rating
            default: 0,
        },
        engagementScore: {
            type: Number, // 0 - 100 rating
            default: 0,
        },
        lastComputed: {
            type: Date,
            default: Date.now,
            index: true,
        }
    }, { timestamps: true });

    export const StudentStats = mongoose.model('StudentStats', StudentStatsSchema);
