import { Admin } from "../../models/admin.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Student } from "../../models/student.models.js";
import { Question } from "../../models/questions.models.js";
import { Test } from "../../models/test.models.js";
import bcrypt from "bcrypt";

// Register Admin
export const registerAdminService = async (fullName, email, password, role) => {
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
export const deleteStudentService = async (studentName) => {
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
export const createProblemSetService = async (problems) => {
  if (!Array.isArray(problems) || problems.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array");
  }

  // Validate input
  for (const problem of problems) {
    if (
      !problem.subject?.trim() ||
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
    const { subject, problemStatement, options, correctOption, allocatedMark } =
      problem;
    const newOptions = options.split(",").map((opt) => opt.trim());

    await Question.create({
      subject,
      problemStatement,
      options: newOptions,
      correctOption,
      allocatedMark,
    });
  }

  return { message: "Problems created successfully" };
};

// Get Problem Set
export const getProblemSetService = async (subject) => {
  const problems = await Question.find({ subject });
  return problems;
};

// Register Students
export const registerStudentService = async (students) => {
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
export const createTestService = async (testData) => {
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
    for_branch: testData.for_branch,
    for_batch: testData.for_batch,
    duration: testData.duration,
    valid_till: validTillDate,
    total_marks: testData.total_marks || 100,
    problems: questionIds,
    description: testData.description,
    instructions: testData.instructions,
    total_questions: testData.numberOfQuestions,
  });

  return newTest;
};

export const createResourceService = async ({ requestAnimationFrame }) => {
  return {};
};
export const createAssignmentService = async ({ requestAnimationFrame }) => {
  return {};
};
export const getQueryService = async ({ requestAnimationFrame }) => {
  return {};
};
export const responseQueryService = async ({ requestAnimationFrame }) => {
  return {};
};
export const getStudentDetailsService = async ({ requestAnimationFrame }) => {
  return {};
};
export const getStudentProjectsDetailService = async ({
  requestAnimationFrame,
}) => {
  return {};
};
export const getAnalyticsService = async ({ requestAnimationFrame }) => {
  return {};
};
