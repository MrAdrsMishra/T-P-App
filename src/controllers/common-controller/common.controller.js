import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  loginUserService,
  logoutUserService,
  updateUserService,
} from "../../services/common-services/common.service.js";
// Login Controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService(
    email,
    password,
    role
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user, accessToken }, "User logged in successfully")
    );
});

// Logout Controller
const logoutUser = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const userId = req.user._id;

  await logoutUserService(userId, role);

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
});

// Update User Profile Controller
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const updatedData = req.body;
  const photoBuffer = req.file?.buffer || null;

  const updatedUser = await updateUserService(userId, updatedData, photoBuffer);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});
export { loginUser, logoutUser, updateUser };
