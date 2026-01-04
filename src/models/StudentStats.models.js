
import mongoose from 'mongoose';

const StudentStatsSchema = new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    totalTests:{
        type:Number,
        required:true,
        default:0
    },
    avgScore:{
        type:Number,
        required:true,
        default:0
    },
    bestRank:{
        type:Number,
        required:true,  
        default:0
    },
});
export const StudentStats = mongoose.model('StudentStats',StudentStatsSchema);