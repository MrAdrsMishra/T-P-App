import mongoose from "mongoose";
import { Schema } from "mongoose";
const subjectSchema = mongoose.Schema({
    subject_name:{
        type:String,
        required:true
    }
})
export const SubjectSchema = mongoose.model('SubjectSchema',subjectSchema); 