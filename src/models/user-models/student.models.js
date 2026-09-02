import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    about: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    enrollment: {
      type: String,
      match: [/\d{4}[A-Z]{2}\d{6}$/, "Enrollment number is required"],
      unique: true,
      trim: true,
      required: true,
      index: true,
    },
    course: {
      type: String,
      trim: true,
      index: true,
    },
    stream: {
      type: String,
      trim: true,
      index: true,
    },
    branch: {
      type: String,
      trim: true,
      index: true,
    },
    batch: {
      type: String,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: "Student",
    },
    photo: {
      type: String,
    },
    totalTestAppeared: {
      type: Number,
      default: 0,
    },
    avgScore: {
      type: Number,
      default: 0,
    },
    lastTestDate: {
      type: Date,
      default: null,
    },
    hasProjects: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  // if not modified
  if (!this.isModified("password")) return next();

  // if ask to modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (requestPassword) {
  return await bcrypt.compare(requestPassword, this.password);
};
studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
studentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Student = mongoose.model("Student", studentSchema);
