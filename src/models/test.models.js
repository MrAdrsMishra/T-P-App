import mongoose from "mongoose";
const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  for_branch: [{
    type: String,
    required: true,
    enum: ["AIML","CSE","EC","EX","DS","CY","AIDS","BS"],
    index:true,
  }],
  for_batch: {
    type: String,
    default: () => new Date().getFullYear().toString(),
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },
  total_questions: {
    type: Number,
    required: true,
    default: 20
  },
  total_marks: {
    type: Number,
    required: true,
    default: 100
  },
  valid_till: {
    type: Date,
    required: true,
  },
 
}, { timestamps: true });
const testSubjectSchema = new mongoose.Schema({
   test_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Test",
    require:true
   },
   subject_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subject",
    require:true
   }
 
}, { timestamps: true });
const testQuestionsSchema = new mongoose.Schema({
   test_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Test",
    require:true
   },
   question_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Questions",
    require:true
   }
 
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
export const TestSubjectSchema = mongoose.model('TestSubjectSchema', testSubjectSchema);
export const TestQuestionsSchema = mongoose.model('TestQuestionsSchema', testQuestionsSchema);