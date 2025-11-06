import mongoose from 'mongoose';
const ScoreInfoSchema = new mongoose.Schema({
    scoreDetails:[
        {
            subject:{
                type:String,
                required:true
            },
            score:{
                type:Number,
                required:true
            },
            timeTaken:{
                type:Number,
                required:true
            },
            totalMarks:{    
                type:Number,
                required:true
            }
        }
    ]
});
export const ScoreInfo = mongoose.model('ScoreInfo',ScoreInfoSchema);