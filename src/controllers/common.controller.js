import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.models.js";
import { Student } from "../models/student.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Test } from "../models/test.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

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

// Login user
 
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

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

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };
  const userObj = user.toObject(); // convert Mongoose doc -> plain object
  delete userObj.password;
  delete userObj.refreshToken;
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: userObj, accessToken },
        "User logged in successfully"
      )
    );
});
const updateUser = asyncHandler(async (req, res) => {
  const updatedData = req.body;
  // validate data
  const {
    mobile,
    email,
    username,
    batch,
    branch,
    github,
    leetcode,
    gfg,
    linkedin,
    about,
  } = updatedData;

  const currentUser = await Student.findById(req.user?._id);
  if (!currentUser) {
    throw new ApiError(400, "User not found");
  }
  // fixed phone regex (was /^d{10}$/ which matches nothing)
  if (mobile && !/^\d{10}$/.test(mobile)) {
    throw new ApiError(400, "Phone number is invalid");
  }
  if (
    email &&
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    throw new ApiError(400, "Email is invalid");
  }
  // upload photo
  let profilePicUrl = currentUser.photo;
  if (req.file) {
    try {
      const result = await uploadOnCloudinary(req.file.buffer);
      // uploadOnCloudinary may return an object; prefer secure_url if present
      profilePicUrl = result?.secure_url || result;
    } catch (error) {
      throw new ApiError(
        500,
        " Somthing went wrong while uploading on cloudinary"
      );
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
  const updateUser = await Student.findByIdAndUpdate(
    req.user._id,
    { $set: finalData },
    { new: true, runValidators: true }
  ).select('-password -refreshToken -__v -createdAt -updatedAt');
  if(!updateUser){
    throw new ApiError(500,"Somthing went wrong while updating user")
  }
  res.send(new ApiResponse(200, updateUser,"Profile updated successfully"));
});
// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  const { role } = req.user; // Assuming req.user is set from auth middleware
  const Model = getUserModel(role);

  await Model.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
})
const getOngoingTestInfo = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.userId;
  if (!userId) {
    throw new ApiError(400, "User id not provided");
  }

  // Await the DB call — originally Student.findById(...) was not awaited causing undefined
  const studentFields = await Student.findById(userId).select(
    "for_branch for_batch valid_till"
  );
  const { for_branch, for_batch, valid_till } = studentFields || {};

  const now = new Date();
  const query = { valid_till: { $gt: now } };
  // optionally filter tests by student's branch/batch if present
  if (for_branch) query.for_branch = for_branch;
  if (for_batch) query.for_batch = for_batch;

  const tests = await Test.find(query).select("-problems -__v");
  // console.log("data fetch completed", tests);
  return res.status(200).json(new ApiResponse(200, tests));
});
const getOngoingTestData = asyncHandler(async (req, res) => {
  const { testId } = req.query;
  // console.log("testId received:", testId);
  if (!testId) {
    throw new ApiError(400, "testId query parameter is required");
  }
  const testData = await Test.findById(testId)
    .select("-__v -createdAt -updatedAt")
    .populate({
      path: "problems",
      select: "-__v -createdAt -updatedAt -correctOption -subject",
    });
  console.log("data fetch completed", testData);
  return res.status(200).json(new ApiResponse(200, testData));
});
export {
  loginUser,
  logoutUser,
  getOngoingTestInfo,
  getOngoingTestData,
  updateUser,
};
