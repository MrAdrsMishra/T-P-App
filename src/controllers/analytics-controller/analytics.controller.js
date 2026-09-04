import { getRankings } from "../../services/analytics-services/rankingEngine.service.js";
import {
  getStudentSummaryService,
  getHierarchicalPerformanceService,
  getSkillsClassificationService,
  getPerformanceTrendsService,
  getCodingAnalyticsService,
  getPlacementReadinessService,
  getPeerComparisonService,
  getAdminOverviewService,
  getAcademicPerformanceService,
  getTopicHeatmapService,
  getQuestionAnalyticsService,
  getAssessmentAnalyticsAdminService,
  getAtRiskStudentsService,
  getImprovementAnalyticsService,
  getParticipationAnalyticsService,
} from "../../services/analytics-services/analytics.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * GET /api/v1/analytics/rankings
 */
export const getRankingsController = asyncHandler(async (req, res) => {
  const {
    metricId,
    scopeType = "GLOBAL",
    scopeId = "ALL",
    periodType = "ALL_TIME",
    periodKey = "ALL",
    rankFrom,
    rankTo,
    page = 1,
    limit = 20,
  } = req.query;

  if (!metricId) {
    throw new ApiError(400, "metricId is required for fetching rankings.");
  }

  const result = await getRankings({
    metricId,
    scopeType,
    scopeId,
    period: { type: periodType, key: periodKey },
    rankFrom: rankFrom ? Number(rankFrom) : undefined,
    rankTo: rankTo ? Number(rankTo) : undefined,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(new ApiResponse(200, result, "Rankings fetched successfully"));
});

/**
 * STUDENT ANALYTICS CONTROLLERS
 */

// GET /api/v1/analytics/student/summary (or /student/:studentId)
export const getStudentSummaryController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const summary = await getStudentSummaryService(studentId);
  return res.status(200).json(new ApiResponse(200, summary, "Student summary fetched successfully"));
});

// GET /api/v1/analytics/student/performance-tree (or /student-tree-performance)
export const getHierarchicalPerformanceController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const result = await getHierarchicalPerformanceService(studentId);
  return res.status(200).json(new ApiResponse(200, result, "Hierarchical performance fetched successfully"));
});

// GET /api/v1/analytics/student/skills
export const getSkillsClassificationController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const weakThreshold = req.query.weakThreshold ? Number(req.query.weakThreshold) : 60;
  const strongThreshold = req.query.strongThreshold ? Number(req.query.strongThreshold) : 80;

  const result = await getSkillsClassificationService(studentId, { weakThreshold, strongThreshold });
  return res.status(200).json(new ApiResponse(200, result, "Skills classification fetched successfully"));
});

// GET /api/v1/analytics/student/trends
export const getPerformanceTrendsController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const result = await getPerformanceTrendsService(studentId);
  return res.status(200).json(new ApiResponse(200, result, "Performance trends fetched successfully"));
});

// GET /api/v1/analytics/student/coding
export const getCodingAnalyticsController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const result = await getCodingAnalyticsService(studentId);
  return res.status(200).json(new ApiResponse(200, result, "Coding analytics fetched successfully"));
});

// GET /api/v1/analytics/student/placement-readiness
export const getPlacementReadinessController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const result = await getPlacementReadinessService(studentId);
  return res.status(200).json(new ApiResponse(200, result, "Placement readiness fetched successfully"));
});

// GET /api/v1/analytics/student/comparison
export const getPeerComparisonController = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?._id || req.query.studentId;
  if (!studentId) throw new ApiError(400, "studentId is required");

  const result = await getPeerComparisonService(studentId);
  return res.status(200).json(new ApiResponse(200, result, "Peer comparison fetched successfully"));
});

/**
 * ADMIN ANALYTICS CONTROLLERS
 */

// GET /api/v1/analytics/admin/overview
export const getAdminOverviewController = asyncHandler(async (req, res) => {
  const overview = await getAdminOverviewService();
  return res.status(200).json(new ApiResponse(200, overview, "Admin overview fetched successfully"));
});

// GET /api/v1/analytics/admin/performance
export const getAcademicPerformanceController = asyncHandler(async (req, res) => {
  const result = await getAcademicPerformanceService();
  return res.status(200).json(new ApiResponse(200, result, "Academic performance breakdown fetched successfully"));
});

// GET /api/v1/analytics/admin/topics (Topic Heatmap)
export const getTopicHeatmapController = asyncHandler(async (req, res) => {
  const result = await getTopicHeatmapService();
  return res.status(200).json(new ApiResponse(200, result, "Topic heatmap fetched successfully"));
});

// GET /api/v1/analytics/admin/questions
export const getQuestionAnalyticsController = asyncHandler(async (req, res) => {
  const result = await getQuestionAnalyticsService();
  return res.status(200).json(new ApiResponse(200, result, "Question analytics fetched successfully"));
});

// GET /api/v1/analytics/admin/assessments
export const getAssessmentAnalyticsAdminController = asyncHandler(async (req, res) => {
  const testId = req.query.testId || req.params.testId;
  const result = await getAssessmentAnalyticsAdminService(testId);
  return res.status(200).json(new ApiResponse(200, result, "Assessment analytics fetched successfully"));
});

// GET /api/v1/analytics/admin/students/at-risk
export const getAtRiskStudentsController = asyncHandler(async (req, res) => {
  const scoreThreshold = req.query.scoreThreshold ? Number(req.query.scoreThreshold) : 50;
  const result = await getAtRiskStudentsService({ scoreThreshold });
  return res.status(200).json(new ApiResponse(200, result, "At-risk students fetched successfully"));
});

// GET /api/v1/analytics/admin/improvement
export const getImprovementAnalyticsController = asyncHandler(async (req, res) => {
  const result = await getImprovementAnalyticsService();
  return res.status(200).json(new ApiResponse(200, result, "Improvement analytics fetched successfully"));
});

// GET /api/v1/analytics/admin/participation
export const getParticipationAnalyticsController = asyncHandler(async (req, res) => {
  const result = await getParticipationAnalyticsService();
  return res.status(200).json(new ApiResponse(200, result, "Participation analytics fetched successfully"));
});
