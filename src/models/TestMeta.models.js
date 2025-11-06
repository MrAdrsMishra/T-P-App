import mongoose from "mongoose";

const TestMetaSchema = new mongoose.Schema({
    testId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Test',
        required:true
    },
    averageScore:{
        type:Number,
        required:true,
        default:0
    },
    subjects:[
        {
            type:String,
            required:true
        }
    ],
    averageTimeTaken:{
        type:Number,
        required:true,
        default:0
    },
    highestScore:{
        type:Number,
        required:true,
        default:0
    },
    totalMarks:{
        type:Number,
        required:true,
        default:0
    },
    totalParticipents:{
        type:Number,
        required:true,
        default:0
    }
});
export const TestMeta = mongoose.model('TestMeta',TestMetaSchema);