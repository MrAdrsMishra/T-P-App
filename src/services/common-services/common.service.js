import { Admin } from "../../models/admin.models.js";
import { Student } from "../../models/student.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Test } from "../../models/test.models.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";

// Utility to get the correct model based on role
const getUserModel = (role) => {
  if (role === "admin") return Admin;
  if (role === "student") return Student;
  throw new ApiError(400, "Invalid role specified");
};

// Generate access & refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId, role) => {
  const Model = getUserModel(role);
  const user = await Model.findById(userId);

  if (!user) {
    throw new ApiError(404, `User not found for role: ${role}`);
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Login User Service
export const loginUserService = async (email, password, role) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const Model = getUserModel(role);
  const user = await Model.findOne({ email });

  if (!user) {
    throw new ApiError(404, `${role} with provided email does not exist`);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    role
  );

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

// Logout User Service
export const logoutUserService = async (userId, role) => {
  const Model = getUserModel(role);

  await Model.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return null;
};

// Update User Service
export const updateUserService = async (userId, updatedData, photoBuffer) => {
  const { mobile, email, username, batch, branch, github, leetcode, gfg, linkedin, about } = updatedData;

  const currentUser = await Student.findById(userId);
  if (!currentUser) {
    throw new ApiError(400, "User not found");
  }

  // Validate phone number
  if (mobile && !/^\d{10}$/.test(mobile)) {
    throw new ApiError(400, "Phone number is invalid");
  }

  // Validate email
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    throw new ApiError(400, "Email is invalid");
  }

  // Upload photo if provided
  let profilePicUrl = currentUser.photo;
  if (photoBuffer) {
    try {
      const result = await uploadOnCloudinary(photoBuffer);
      profilePicUrl = result?.secure_url || result;
    } catch (error) {
      throw new ApiError(500, "Something went wrong while uploading on cloudinary");
    }
  }

  const finalData = {
    fullName: username,
    photo: profilePicUrl,
    about_yourself: about,
    email: email,
    phone: mobile,
    social_links: {
      Github: github,
      Leetcode: leetcode,
      GeekForGeeks: gfg,
      LinkedIn: linkedin,
    },
    branch,
    batch,
  };

  const updatedUser = await Student.findByIdAndUpdate(
    userId,
    { $set: finalData },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -__v -createdAt -updatedAt");

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating user");
  }

  return updatedUser;
};
