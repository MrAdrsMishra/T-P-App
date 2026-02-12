import { Admin } from "../../models/user-models/admin.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Student } from "../../models/user-models/student.models.js";
import { Question } from "../../models/test-models/questions.models.js";
import { Test } from "../../models/test-models/test.models.js";
import bcrypt from "bcrypt";
import { TestAttempt } from "../../models/test-models/testAttempts.models.js";
import { Resource } from "../../models/test-models/resource.models.js";

// Register Admin
const registerAdminService = async (fullName, email, password, role) => {
  // Check if any field is empty
  if (
    [fullName, email, password, role].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists by email or fullName
  const existedAdmin = await Admin.findOne({
    $or: [{ email }, { fullName }],
  });

  if (existedAdmin) {
    throw new ApiError(409, "Admin with provided credential already exists!");
  }

  // Create new admin
  const admin = await Admin.create({
    fullName,
    email,
    password,
    role,
  });

  // Verify creation
  const createdAdmin = await Admin.findById(admin._id);

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return createdAdmin;
};

// Delete Student
const deleteStudentService = async (studentName) => {
  if (!studentName) {
    throw new ApiError(400, "Student ID is required.");
  }

  // Find and delete the student
  const deletedStudent = await Student.findOneAndDelete({
    fullName: studentName,
  });

  if (!deletedStudent) {
    throw new ApiError(404, "Student not found. Deletion failed.");
  }

  return deletedStudent;
};

// Create Problem Set
const createProblemSetService = async (problems) => {
  if (!Array.isArray(problems) || problems.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array");
  }

  // Validate input
  for (const problem of problems) {
    if (
      !problem.subject?.trim() ||
      !problem.topic?.trim() ||
      !problem.problemStatement?.trim() ||
      !problem.options?.trim() ||
      !problem.correctOption?.trim() ||
      !problem.allocatedMark
    ) {
      throw new ApiError(
        401,
        "Each problem must have subject, problemStatement, options, correctOption and allocatedMark"
      );
    }

    if (isNaN(problem.allocatedMark) || problem.allocatedMark <= 0) {
      throw new ApiError(401, "allocatedMark must be a positive number");
    }
  }

  // Insert into database
  for (const problem of problems) {
    const { subject, topic, problemStatement, options, correctOption, allocatedMark } =
      problem;
    const newOptions = options.split(",").map((opt) => opt.trim());

    await Question.create({
      subject,
      topic,
      problemStatement,
      options: newOptions,
      correctOption,
      allocatedMark,
    });
  }

  return { message: "Problems created successfully" };
};
// Register Students
const registerStudentService = async (students) => {
  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array");
  }

  // Validate input
  for (const student of students) {
    if (
      !student.fullName?.trim() ||
      !student.email?.trim() ||
      !student.enrollment?.trim()
    ) {
      throw new ApiError(
        401,
        "Each student must have fullName, email and enrollment"
      );
    }
  }

  // Check duplicates in DB
  const emails = students.map((s) => s.email);
  const fullNames = students.map((s) => s.fullName);
  const enrollments = students.map((s) => s.enrollment);

  const existing = await Student.find({
    $or: [
      { email: { $in: emails } },
      { fullName: { $in: fullNames } },
      { enrollment: { $in: enrollments } },
    ],
  });

  if (existing.length > 0) {
    const conflicts = existing.map((s) => ({
      fullName: s.fullName,
      email: s.email,
      enrollment: s.enrollment,
    }));
    throw new ApiError(409, "Some students already exist", conflicts);
  }

  // Hash passwords and prepare students data
  const hashedStudents = await Promise.all(
    students.map(async (s) => ({
      fullName: s.fullName,
      email: s.email,
      enrollment: s.enrollment,
      password: await bcrypt.hash(s.enrollment, 10),
    }))
  );

  // Create students using insertMany
  const createdStudents = await Student.insertMany(hashedStudents);

  if (!createdStudents || createdStudents.length === 0) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  return createdStudents;
};

// Create Test
const createTestService = async (testData) => {
  if (!testData) {
    throw new ApiError(400, "Test data is required");
  }

  // Validate required fields
  const requiredFields = [
    { key: "title", message: "Test title is required" },
    { key: "for_branch", message: "Select a valid branch" },
    { key: "for_batch", message: "Select a valid batch" },
    { key: "categories", message: "At least one category is required" },
    { key: "duration", message: "Valid test duration is required" },
    {
      key: "numberOfQuestions",
      message: "Valid number of questions is required",
    },
    { key: "description", message: "Test description is required" },
    { key: "instructions", message: "Test instructions are required" },
  ];

  for (const field of requiredFields) {
    if (
      !testData[field.key] ||
      (Array.isArray(testData[field.key]) && testData[field.key].length === 0)
    ) {
      throw new ApiError(401, field.message);
    }
  }

  // Validate problems
  if (
    !testData.problemsByCategory ||
    Object.keys(testData.problemsByCategory).length === 0
  ) {
    throw new ApiError(401, "Problems for each category are required");
  }

  // Push problems into Question collection and collect their _id
  const questionIds = [];
  for (const [category, problems] of Object.entries(
    testData.problemsByCategory
  )) {
    for (const problem of problems) {
      if (!problem.problemStatement || !problem.correctOption) {
        throw new ApiError(
          401,
          `Problem in category ${category} is missing required fields`
        );
      }

      const newQuestion = await Question.create({
        problemStatement: problem.problemStatement,
        options: problem.options || [],
        correctOption: problem.correctOption,
        allocatedMark: problem.markAllocated || 1,
        subject: category,
      });

      questionIds.push(newQuestion._id);
    }
  }

  // Create Test with valid_till set to 2 days from now
  const validTillDate = new Date();
  validTillDate.setDate(validTillDate.getDate() + 2);

  const newTest = await Test.create({
    title: testData.title,
    subjects: testData.categories,
    forBranch: testData.for_branch,
    forBatch: testData.for_batch,
    duration: testData.duration,
    validTill: validTillDate,
    totalMarks: testData.total_marks || 100,
    questions: questionIds,
    description: testData.description,
    instruction: testData.instructions,
    totalQuestions: testData.numberOfQuestions,
    status: "UPCOMING"
  });

  return newTest;
};

const createResourceService = async () => {
  return {};
};
const createAssignmentService = async ({ requestAnimationFrame }) => {
  return {};
};
const getQueryService = async ({ requestAnimationFrame }) => {
  return {};
};
const responseQueryService = async ({ requestAnimationFrame }) => {
  return {};
};
const getStudentAnalyticsService = async ({ studentId }) => {
  return {};
};
const getStudentProjectsDetailService = async ({
  studentId,
}) => {
  return {};
};

const getAnalyticsService = async (filters = {}) => {
  const { batch } = filters;
  const matchStage = {};
  if (batch) matchStage.batch = batch;

  // Total Students
  const totalStudents = await Student.countDocuments(matchStage);

  // Active Tests (validTill > now)
  const activeTests = await Test.countDocuments({
    validTill: { $gt: new Date() },
    ...(batch && { forBatch: batch }),
  });

  // Avg Score
  const avgScoreResult = await Student.aggregate([
    { $match: matchStage },
    { $group: { _id: null, avg: { $avg: "$avgScore" } } },
  ]);
  const avgScore = avgScoreResult[0]?.avg || 0;

  // Completion Rate
  const totalTestsForBatch = await Test.countDocuments({
    ...(batch && { forBatch: batch }),
  });

  const studentStats = await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTestAppeared: { $sum: "$totalTestAppeared" },
      },
    },
  ]);
  const totalAppeared = studentStats[0]?.totalTestAppeared || 0;

  const completionRate =
    totalTestsForBatch > 0 && totalStudents > 0
      ? ((totalAppeared / (totalStudents * totalTestsForBatch)) * 100).toFixed(
        2
      )
      : 0;

  // Top Performers
  const topPerformers = await Student.find(matchStage)
    .sort({ avgScore: -1 })
    .limit(20)
    .select("fullName email avgScore totalTestAppeared photo");

  // Recent Activities (from Test Attempts)
  const recentAttempts = await TestAttempt.find({})
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("studentId", "fullName")
    .populate("testId", "title");

  const recentActivities = recentAttempts.map((attempt) => ({
    student: attempt.studentId?.fullName || "Unknown",
    action: `Completed ${attempt.testId?.title || "Test"}`,
    time: attempt.updatedAt,
    score: attempt.testScore + "%",
  }));

  // If few activities, maybe add some recent tests created by admin? 
  // For now simplest is just attempts.

  return {
    totalStudents,
    activeTests,
    avgScore: parseFloat(avgScore.toFixed(2)),
    completionRate,
    topPerformers,
    recentActivities,
  };
};
const getTestAnalyticsService = async (testId) => {
  if (!testId) {
    throw new ApiError(400, "Test ID is required")
  }
  const test = await Test.findById(testId)
  if (!test) {
    throw new ApiError(404, "Test not found")
  }
  const testAttempts = await TestAttempt.find({ testId })
  if (!testAttempts) {
    throw new ApiError(404, "Test attempts not found")
  }
  const totalStudents = testAttempts.length
  const totalScore = testAttempts.reduce((acc, attempt) => acc + attempt.testScore, 0)
  const avgScore = totalScore / totalStudents
  const topPerformers = testAttempts.sort((a, b) => b.testScore - a.testScore).slice(0, 10)
  return {
    test,
    testAttempts,
    totalStudents,
    totalScore,
    avgScore,
    topPerformers
  }
}
const getTotalTestAnalyticsService = async (filter = {}) => {
  const { batch, branch } = filter // if brancch not provided in filter then it will fetch all tests
  const tests = await Test.aggregate([
    {
      $match: {
        forBatch: batch,
        ...(branch && { forBranch: branch })
      }
    }
  ])
  if (!tests) {
    throw new ApiError(404, "Tests not found")
  }
  const totalTests = tests.length
  const totalScore = tests.reduce((acc, test) => acc + test.testScore, 0)
  const avgScore = totalScore / totalTests
  const topPerformers = tests.sort((a, b) => b.testScore - a.testScore).slice(0, 10)
  return {
    tests,
    totalTests,
    totalScore,
    avgScore,
    topPerformers
  }
}
const getTotalResourcesAnalyticsService = async (filter = {}) => {
  const { batch } = filter
  const resources = await Resource.find({batch})
  if (!resources) {
    throw new ApiError(404, "Resources not found")
  }
  const totalResources = resources.length
  const totalScore = resources.reduce((acc, resource) => acc + resource.resourceScore, 0)
  const avgScore = totalScore / totalResources
  const topPerformers = resources.sort((a, b) => b.resourceScore - a.resourceScore).slice(0, 10)
  return {
    resources,
    totalResources,
    totalScore,
    avgScore,
    topPerformers
  }
}
export {
  registerAdminService,
  deleteStudentService,
  createProblemSetService,
  registerStudentService,
  createTestService,
  createResourceService,
  createAssignmentService,
  getQueryService,
  responseQueryService,
  getStudentAnalyticsService,
  getStudentProjectsDetailService,
  getAnalyticsService,
  getTestAnalyticsService,
  getTotalTestAnalyticsService,
  getTotalResourcesAnalyticsService
}