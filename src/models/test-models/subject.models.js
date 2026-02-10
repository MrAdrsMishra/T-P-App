import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
}, { timestamps: true });

export const Subject = mongoose.model('Subject', subjectSchema);