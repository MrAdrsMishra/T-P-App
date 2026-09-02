import { Admin } from "../../models/user-models/admin.models.js";
import { Student } from "../../models/user-models/student.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Test } from "../../models/test-models/test.models.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Question } from "../../models/test-models/questions.models.js";
import { TestMeta } from "../../models/test-models/TestMeta.models.js";
import { Subject } from "../../models/test-models/subject.models.js";
import { Option } from "../../models/test-models/option.models.js";

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
const loginUserService = async (email, password, role) => {
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
const logoutUserService = async (userId, role) => {
  const Model = getUserModel(role);

  await Model.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return null;
};

// Update User Service
const updateUserService = async (userId, updatedData, photoBuffer) => {
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

  const currentUser = await Student.findById(userId);
  if (!currentUser) {
    throw new ApiError(400, "User not found");
  }

  // Validate phone number
  if (mobile && !/^\d{10}$/.test(mobile)) {
    throw new ApiError(400, "Phone number is invalid");
  }

  // Validate email
  if (
    email &&
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    throw new ApiError(400, "Email is invalid");
  }

  // Upload photo if provided
  let profilePicUrl = currentUser.photo;
  if (photoBuffer) {
    try {
      const result = await uploadOnCloudinary(photoBuffer);
      profilePicUrl = result?.secure_url || result;
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while uploading on cloudinary"
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

// Get Problem Set Service
const getProblemsService = async ({ subject, topic, page = 1, limit = 20 }) => {
  const query = {};

  if (subject) {
    query.subject = subject;
  }

  if (topic) {
    query.topic = topic;
  }

  const skip = (page - 1) * limit;

  const problems = await Question.find(query).skip(skip).limit(limit);

  const total = await Question.countDocuments(query);

  return {
    problems,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

// Provides ongoing test info tailored to requester role (student/admin)
const getOngoingTestInfoService =  (async({ page = 1, limit = 20 } = {}, user = null)  => {
  const skip = (page - 1) * limit;
  const now = new Date();

  // Default: return tests whose validTill is in future
  const testQuery = { validTill: { $gt: now } };

  // Fetch tests (basic fields)
  const tests = await Test.find(testQuery)
    .select("title description duration validTill createdBy forBranch forBatch")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Test.countDocuments(testQuery);

  const role = user?.role;

  if (role === "student") {
    // For each test, attach its TestMeta.problems (questions) and totalMarks and subjects
    const results = await Promise.all(
      tests.map(async (t) => {
        const meta = await TestMeta.findOne({ testId: t._id })
          .populate({ path: "problems", select: "subjectId topic allocatedMark problemStatement questionType" })
          .populate({ path: "subjects", select: "subjectName" })
          .lean();

        return {
          testId: t._id,
          title: t.title,
          description: t.description,
          duration: t.duration,
          validTill: t.validTill,
          subjects: meta?.subjects || [],
          questions: meta?.problems || [],
          totalMarks: meta?.totalMarks ?? null,
        };
      })
    );

    return {
      results,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  if (role === "admin") {
    // Admins get TestMeta summary info
    const metas = await TestMeta.find({ testId: { $in: tests.map((t) => t._id) } })
      .populate({ path: "testId", select: "title createdAt validTill" })
      .populate({ path: "subjects", select: "subjectName" })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const results = metas.map((m) => ({
      testId: m.testId?._id || m.testId,
      title: m.testId?.title || null,
      createdAt: m.testId?.createdAt || null,
      validTill: m.testId?.validTill || null,
      totalParticipants: m.totalParticipents,
      status: m.status,
      subjects: m.subjects || [],
      averageScore: m.averageScore,
      highestScore: m.highestScore,
    }));

    return {
      results,
      page: parseInt(page),
      limit: parseInt(limit),
      total: metas.length,
      totalPages: Math.ceil(metas.length / limit),
    };
  }

  // Default (unauthenticated or unknown role): return basic test info
  const basic = tests.map((t) => ({
    testId: t._id,
    title: t.title,
    description: t.description,
    duration: t.duration,
    validTill: t.validTill,
  }));

  return {
    results: basic,
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
  };
});

// Provides detailed test data; accepts { testId } and requester `user` to tailor response
const getOngoingTestDataService =  (async ({ testId } = {}, user = null) => {
  if (!testId) {
    throw new ApiError(400, "testId query parameter is required");
  }

  const role = user?.role;

  const test = await Test.findById(testId).select("title description duration validTill createdBy forBranch forBatch createdAt").lean();
  if (!test) throw new ApiError(404, "Test not found");

  let meta = await TestMeta.findOne({ testId: test._id })
    .populate({
      path: "problems",
      select: "_id subjectId topic allocatedMark problemStatement questionType options",
      populate: {
        path: "options.optionId",
        select: "optionValue"
      }
    })
    .populate({ path: "subjects", select: "subjectName" })
    .lean();

  // Debug logging
  console.log(`[getOngoingTestDataService] testId: ${testId}`);
  console.log(`[getOngoingTestDataService] TestMeta found:`, meta ? "YES" : "NO");

  // If TestMeta doesn't exist, create it with empty problems
  if (!meta) {
    console.log(`[getOngoingTestDataService] Creating TestMeta for test: ${testId}`);
    try {
      meta = await TestMeta.create({
        testId: test._id,
        problems: [],
        subjects: [],
        totalMarks: 0,
        status: "UPCOMING",
        averageScore: 0,
        highestScore: 0,
        totalParticipents: 0,
      });
      console.log(`[getOngoingTestDataService] TestMeta created successfully`);
    } catch (error) {
      console.error(`[getOngoingTestDataService] Error creating TestMeta:`, error.message);
      // Set default meta object if creation fails
      meta = {
        problems: [],
        subjects: [],
        totalMarks: 0,
        status: "UPCOMING",
      };
    }
  }

  if (meta) {
    console.log(`[getOngoingTestDataService] Problems count:`, meta.problems?.length || 0);
    console.log(`[getOngoingTestDataService] Subjects count:`, meta.subjects?.length || 0);
  }

  if (role === "student") {
    return {
      testId: test._id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      validTill: test.validTill,
      subjects: meta?.subjects || [],
      problems: meta?.problems || [],
      totalMarks: meta?.totalMarks ?? null,
    };
  }

  if (role === "admin") {
    return {
      testId: test._id,
      title: test.title,
      createdAt: test.createdAt,
      validTill: test.validTill,
      totalParticipants: meta?.totalParticipents ?? 0,
      status: meta?.status || "UPCOMING",
      subjects: meta?.subjects || [],
      averageScore: meta?.averageScore ?? 0,
      highestScore: meta?.highestScore ?? 0,
      totalMarks: meta?.totalMarks ?? null,
    };
  }

  // Default: return student-like view
  return {
    testId: test._id,
    title: test.title,
    description: test.description,
    duration: test.duration,
    validTill: test.validTill,
    subjects: meta?.subjects || [],
    problems: meta?.problems || [],
    totalMarks: meta?.totalMarks ?? null,
  };
});

export {
  loginUserService,
  logoutUserService,
  updateUserService,
  getProblemsService,
  getOngoingTestInfoService,
  getOngoingTestDataService,
};
