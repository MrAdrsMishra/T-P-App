import mongoose from "mongoose";

const RankHistorySchema = new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    rankRecords:[
        {
            testId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Test',
                required:true
            },
            rank:{
                type:Number,
                required:true
            },
        }
    ]
});
export const RankHistory = mongoose.model('RankHistory',RankHistorySchema);