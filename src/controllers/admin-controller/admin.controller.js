import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  registerAdminService,
  deleteStudentService,
  createProblemSetService,
  getProblemSetService,
  registerStudentService,
  createTestService,
} from "../../services/admin-services/admin.service.js";

// Register Admin Controller
const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const createdAdmin = await registerAdminService(
    fullName,
    email,
    password,
    role
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully"));
});

// Delete Student Controller
const deleteStudent = asyncHandler(async (req, res) => {
  // Ensure the user has the Admin role
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Access denied. Only Admins can delete students.");
  }

  const { studentName } = req.body;

  const deletedStudent = await deleteStudentService(studentName);

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

// Check Admin Role Middleware
const checkAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Create Problem Set Controller
const createProblemSet = asyncHandler(async (req, res) => {
  const problems = req.body;

  await createProblemSetService(problems);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Problems created successfully"));
});

// Get Problem Set Controller
const getProblemSet = asyncHandler(async (req, res) => {
  const { subject } = req.body;

  const problems = await getProblemSetService(subject);

  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems retrieved successfully"));
});

// Register Student Controller
const registerStudent = asyncHandler(async (req, res) => {
  const students = req.body;

  const createdStudents = await registerStudentService(students);

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdStudents, "Students registered successfully")
    );
});

// Create Test Controller
const createTest = asyncHandler(async (req, res) => {
  const { testData } = req.body;

  const newTest = await createTestService(testData);

  return res
    .status(201)
    .json(new ApiResponse(201, newTest, "Test created successfully"));
});

const createResource=asyncHandler(async(req,res)=>{
    await createResourceService
})
const createAssignment=asyncHandler(async(req,res)=>{
    await createAssignmentService
})
const getQuery=asyncHandler(async(req,res)=>{
    await getQueryService
})
const responseQuery=asyncHandler(async(req,res)=>{
    await responseQueryService
})
const getStudentDetails=asyncHandler(async(req,res)=>{
    await getStudentDetailsService
})
const getStudentProjectsDetail=asyncHandler(async(req,res)=>{
    await getStudentProjectsDetailService
})
const getAnalytics=asyncHandler(async(req,res)=>{
    await getAnalyticsService
})
export {
  registerAdmin,
  deleteStudent,
  checkAdminRole,
  createProblemSet,
  getProblemSet,
  registerStudent,
  createTest,
  createResource,
  createAssignment,
  getQuery,
  responseQuery,
  getStudentDetails,
  getStudentProjectsDetail,
  getAnalytics,
};
