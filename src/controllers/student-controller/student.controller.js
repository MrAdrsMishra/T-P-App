import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  submitTestService,
  submitSolutionService,
  getAnalyticsService,
  getStudentStatsService,
  getSubjectPerformanceService,
  getPerformanceTrendsService,
  getAccuracyMatrixService,
  getLeaderboardService,
  getPersonalRankingService,
  submitQueryService,
  getResourcesService,
  getTestHistoryService
} from "../../services/student-services/student.service.js";

// Submit Test Controller
const submitTest = asyncHandler(async (req, res) => {
  const { testId, answers, timeTaken } = req.body;
  const studentId = req.user._id;

  const result = await submitTestService(testId, answers, studentId, timeTaken);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Test submitted successfully."));
});

// Submit Practice Solution Controller
const submitSolution = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const session = await submitSolutionService(req.body, studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Practice solution recorded successfully."));
});

// Overall Student Dashboard Analytics Controller
const getAnalytics = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const analytics = await getAnalyticsService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Student analytics fetched successfully."));
});

// Pre-Calculated Student Stats Controller
const getStudentStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const stats = await getStudentStatsService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Student stats fetched successfully."));
});

// Subject-Wise Performance Controller
const getSubjectPerformance = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const subjectPerformance = await getSubjectPerformanceService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, subjectPerformance, "Subject performance fetched successfully."));
});

// Performance Trends Controller
const getPerformanceTrends = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const trends = await getPerformanceTrendsService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, trends, "Performance trends fetched successfully."));
});

// Accuracy Matrix Controller
const getAccuracyMatrix = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const accuracyMatrix = await getAccuracyMatrixService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, accuracyMatrix, "Accuracy matrix fetched successfully."));
});

// Leaderboard Controller (Supports branch, batch, category filtering)
const getLeaderboard = asyncHandler(async (req, res) => {
  const { branch, batch, category, limit } = req.query;
  const leaderboard = await getLeaderboardService({
    branch,
    batch,
    category,
    limit: limit ? parseInt(limit, 10) : 50
  });

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboard, "Leaderboard fetched successfully."));
});

// Personal Multi-Tier Ranking Controller
const getPersonalRanking = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const ranking = await getPersonalRankingService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, ranking, "Personal ranking fetched successfully."));
});

// Submit Query Message Controller
const submitQuery = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const queryMessage = await submitQueryService(req.body, studentId);

  return res
    .status(201)
    .json(new ApiResponse(201, queryMessage, "Query submitted successfully."));
});

// Get Resources Controller
const getResources = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const resources = await getResourcesService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, resources, "Resources fetched successfully."));
});

// Get Test History Controller
const getTestHistory = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const testHistory = await getTestHistoryService(studentId);

  return res
    .status(200)
    .json(new ApiResponse(200, testHistory, "Test history fetched successfully."));
});

export {
  submitTest,
  submitSolution,
  getAnalytics,
  getStudentStats,
  getSubjectPerformance,
  getPerformanceTrends,
  getAccuracyMatrix,
  getLeaderboard,
  getPersonalRanking,
  submitQuery,
  getResources,
  getTestHistory,
};
