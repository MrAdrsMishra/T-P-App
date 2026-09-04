import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  registerAdminService,
  deleteStudentService,
  createProblemSetService,
  registerStudentService,
  createTestService,
  createResourceService,
  createAssignmentService,
  getQueryService,
  responseQueryService,
  getStudentProjectsDetailService,
  getAnalyticsService,
  getTestAnalyticsService,
  getTotalTestAnalyticsService,
  getTotalResourcesAnalyticsService,
} from "../../services/admin-services/admin.service.js";
import { getProblems } from "../common-controller/common.controller.js";

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
    .status(200)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
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
  const { subject,topics=[]} = req.body;

  const problems = await getProblems({subject,topics});

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
    const {title,description,url,type,category,tags}=req.body
    await createResourceService({title,description,url,type,category,tags})
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Resource created successfully"));
})
const createAssignment=asyncHandler(async(req,res)=>{
  const {title,deadline,task,subject}= req.body;
    await createAssignmentService({title,deadline,task,subject})
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Assignment created successfully"));
})
const getQuery=asyncHandler(async(req,res)=>{
    const queries=await getQueryService()
    return res
    .status(200)
    .json(new ApiResponse(200, queries, "Queries retrieved successfully"));
})
const responseQuery=asyncHandler(async(req,res)=>{
    const {queryId,response}=req.body
    await responseQueryService({queryId,response})
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Query responded successfully"));
})
const getStudentAnalytics=asyncHandler(async(req,res)=>{
  const {studentId}=req.body
    const students=await getStudentAnalyticsService({studentId})
    return res
    .status(200)
    .json(new ApiResponse(200, students, "Students retrieved successfully"));
})
const getStudentProjectsDetail=asyncHandler(async(req,res)=>{
    const {studentId}=req.body
    const projects=await getStudentProjectsDetailService({studentId})
    return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects retrieved successfully"));
})
const getAnalytics=asyncHandler(async(req,res)=>{
  const batch= req.query.batch || new Date().getFullYear()
    const analytics=await getAnalyticsService({batch})
    return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Analytics retrieved successfully"));
})
const getTestAnalytics=asyncHandler(async(req,res)=>{
  const {testId}=req.params
    const analytics= await getTestAnalyticsService(testId)
    return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Test Analytics retrieved successfully"));
})
const getTotalTestAnalytics=asyncHandler(async(req,res)=>{
  const {batch,branch}=req.query
    const analytics= await getTotalTestAnalyticsService({batch,branch})
    return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Test Analytics retrieved successfully"));
})
const getTotalResourcesAnalytics=asyncHandler(async(req,res)=>{
  const batch= req.query.batch || new Date().getFullYear()
    const analytics= await getTotalResourcesAnalyticsService({batch})
    return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Resources Analytics retrieved successfully"));
})
export {
  registerAdmin, // req.body
  deleteStudent, // req.body
  createProblemSet, // req.body
  getProblemSet, // req.body
  registerStudent, // req.body
  createTest, // req.body
  createResource, // req.body
  createAssignment, // req.body
  getQuery, // req.body
  responseQuery, // req.body
  getStudentAnalytics, // req.body
  getStudentProjectsDetail, // req.body
  getAnalytics, // req.query
  getTestAnalytics, // req.params
  getTotalTestAnalytics, // req.query
  getTotalResourcesAnalytics, // req.query
};
