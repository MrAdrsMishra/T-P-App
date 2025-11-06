import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.models.js";
import { Question } from "../models/questions.models.js";
import { Test } from "../models/test.models.js";
import bcrypt from 'bcrypt'

const registerAdmin = asyncHandler(async (req, res) => {
  // steps
  // get data
  // check data
  // if not already registered
  // create entry

  // get details from the API request
  const {fullName, email, password, role } = req.body;
  // check if any field is empty
  if ([fullName,email, password, role].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exist by email or full name
  const existedAdmin = await Admin.findOne({$or: [{ email }, { fullName }]});
  // alredy registered the give error
  if (existedAdmin) {
    throw new ApiError(409, "Admin with provided credintial already exist!");
  }
  // otherwise create entry in database
  const admin = await Admin.create({
    fullName,
    email,
    password,
    role: role,
  });
  // check if cretaed sccessfully by search
  const createdAdmin = await Admin.findById(admin._id);
  // if not created
  if (!createdAdmin) {
    throw new ApiError(
      500,
      createdAdmin,
      "somthing went wrong while registring the admin"
    );
  }
  // if created successfully return some details
  return res
    .status(200)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully"));
});

const deleteStudent = asyncHandler(async (req, res) => {
  // Ensure the user has the Admin role
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Access denied. Only Admins can delete students.");
  }

  // Get the student ID from the request (e.g., from req.params or req.body)
  const { studentName } = req.body; // Assuming the student ID is passed as a route parameter

  if (!studentName) {
    throw new ApiError(400, "Student ID is required.");
  }

  // Find and delete the student by ID
  const deletedStudent = await Student.findOneAndDelete(studentName);

  if (!deletedStudent) {
    throw new ApiError(404, "Student not found. Deletion failed.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedStudent,
        "Student removed from the database successfully!"
      )
    );
});

const checkAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const createProblemSet = asyncHandler(async (req, res) => {
  // get details
  const problems = req.body; // Expecting array of objects
 
  if (!Array.isArray(problems) || problems.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array");
  }
  // validate input
  for (const problem of problems) {
    console.log(problem);
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
  // insert into db
  for (const problem of problems) {
    const { subject, problemStatement, options, correctOption, allocatedMark } =
      problem;
    const newOptions = options.split(",").map((opt) => opt.trim());
    // insert problem into db
    await Question.create({
      subject,
      problemStatement,
      options: newOptions,
      correctOption,
      allocatedMark,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "problem created successfully"));
});
const getProblemSet = asyncHandler(async (req, res) => {
  const { subject } = req.body;
  const problems = await Question.find({ subject });
  return res.status(200).json(new ApiResponse(200, problems));
});
const registerStudent = asyncHandler(async (req, res) => {
  const students = req.body; // Expecting array of objects

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
    throw new ApiError(409, `Some students already exist`, conflicts);
  }
  // hash passwords and prepare students data
  const hashedStudents = await Promise.all(
  students.map(async (s) => ({
    fullName: s.fullName,
    email: s.email,
    enrollment: s.enrollment,
    password: await bcrypt.hash(s.enrollment, 10),
  }))
);
  // Create students (using insertMany for efficiency)
const createdStudents = await Student.insertMany(hashedStudents);

  if (!createdStudents || createdStudents.length === 0) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, null, "Students registered successfully"));
});
const createTest = asyncHandler(async (req, res) => {
  const { testData } = req.body;

  if (!testData) throw new ApiError(400, "Test data is required");

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

  // // Validate total questions
  // if (questionIds.length !== testData.numberOfQuestions) {
  //   throw new ApiError(
  //     401,
  //     `Total questions (${questionIds.length}) do not match numberOfQuestions (${testData.numberOfQuestions})`
  //   );
  // }

  // Create Test
  // Hardcode valid_till to 2 days from now
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
    problems: questionIds, // Reference ObjectIds of Question collection
    description: testData.description,
    instructions: testData.instructions,
    total_questions: testData.numberOfQuestions,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Test created successfully", newTest));
});

export {
  registerAdmin,
  deleteStudent,
  checkAdminRole,
  createProblemSet,
  getProblemSet,
  registerStudent,
  createTest,
};
