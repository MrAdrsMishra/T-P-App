// {
//   studentId,
//   totalTests: Number,
//   totalScore: Number,
//   avgScore: Number,
//   bestRank: Number,
//   totalTimeSpent: Number,
//   subjectWise: [
//     { subject: "Math", avgScore: 89, attempts: 5 },
//     { subject: "English", avgScore: 82, attempts: 4 }
//   ]
// }
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
    subjectWise:[
        {  
            subject:{
                type:String,
                required:true
            },
            avgScore:{
                type:Number,
                required:true,
                default:0
            },
            avgTimeTaken:{
                type:Number,
                required:true,
                default:0
            }
        }
    ]
});
export const StudentStats = mongoose.model('StudentStats',StudentStatsSchema);