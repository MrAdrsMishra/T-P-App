import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { submitTestService } from "../../services/student-services/student.service.js";
import {
  getOngoingTestInfoService,
  getOngoingTestDataService,
} from "../../services/common-services/common.service.js";

// Submit Test Controller
const submitTest = asyncHandler(async (req, res) => {
  const { testId, answers } = req.body;
  const studentId = req.user._id;

  const score = await submitTestService(testId, answers, studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, score, "Test submitted successfully."));
});

const submitSolution = asyncHandler(async (req, res) => {
  await submitSolutionService();
});
const getAnalytics = asyncHandler(async (req, res) => {
  await getAnalyticsService();
});

const submitQuery = asyncHandler(async (req, res) => {
  await submitQueryService();
});
const getResources = asyncHandler(async (req, res) => {
  await getResourcesService();
});
const getTestHistory = asyncHandler(async (req, res) => {
  await getTestHistoryService();
});
const getOngoingTestInfo=asyncHandler(async(req,res)=>{
  await getOngoingTestInfoService()
})
export {
  submitTest,
  submitSolution,
  getAnalytics,
  submitQuery,
  getResources,
  getTestHistory,
};
