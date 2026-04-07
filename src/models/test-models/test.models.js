import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
<<<<<<< HEAD:src/models/test.models.js
=======
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
>>>>>>> 49f3765113c383968e62e1364af65830e1d48d81:src/models/test-models/test.models.js
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  forBranch: [{
    type: String,
    required: true,
    enum: ["AIML", "CSE", "EC", "EX", "DS", "CY", "AIDS", "BS"],
    index: true,
  }],
  forBatch: {
    type: String,
    default: () => new Date().getFullYear().toString(),
  },
  duration: {
    type: Number,
    required: true,
    default: 30,
  },
  // Meta information (questions, totals, stats) moved to TestMeta
  validTill: {
    type: Date,
    required: true,
  },
<<<<<<< HEAD:src/models/test.models.js
 
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
 
=======
>>>>>>> 49f3765113c383968e62e1364af65830e1d48d81:src/models/test-models/test.models.js
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
export const TestSubjectSchema = mongoose.model('TestSubjectSchema', testSubjectSchema);
export const TestQuestionsSchema = mongoose.model('TestQuestionsSchema', testQuestionsSchema);