import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
//  adminid string pk
//   fullName string 
//   email string 
//   password string 
//   phone string 
//   collegeId string 
//   Role string 
//   subject string
//   refreshToken string 
//   timestamp date
const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  password: { 
    type: String,
    required: [true, "password is required"] 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type:String,
    // required:true,
    trim:true
  },
  collegeId: {
    type:String,
    // required:true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  role:{
    type:String,
    default:"Admin"
  },
  refreshToken:{
    type:String,
  }
},{timestamps:true});

adminSchema.pre("save", async function (next){
  // if not modified 
  if(!this.isModified("password"))return next();

  // if ask to modified
  this.password = await bcrypt.hash(this.password,10)
  next()
});

adminSchema.methods.isPasswordCorrect = async function (requestPassword) {
  return await bcrypt.compare(requestPassword, this.password);
};
adminSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role:this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
adminSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};
export const Admin = mongoose.model("Admin", adminSchema);
