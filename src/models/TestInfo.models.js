import mongoose from 'mongoose';

const TestInfoSchema = new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    testId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Test',
        required:true
    },
    scoreId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ScoreInfo',
        required:true
    }
});
export const TestInfo = mongoose.model('TestInfo',TestInfoSchema);