import { getRankings } from "../../services/analytics-services/rankingEngine.service.js";
import { StudentMetricPerformance } from "../../models/analytics-models/StudentMetricPerformance.models.js";
import { Metric } from "../../models/analytics-models/Metric.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * GET /api/v1/analytics/rankings
 * Accepts metricId, scopeType, scopeId, rankFrom, rankTo, page, limit
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
 * GET /api/v1/analytics/student-tree-performance
 * Returns student performance mapped to the Metric ancestor tree
 */
export const getStudentTreePerformanceController = asyncHandler(async (req, res) => {
  const studentId = req.user?._id || req.query.studentId;

  if (!studentId) {
    throw new ApiError(401, "Unauthorized or studentId required");
  }

  const periodType = req.query.periodType || "ALL_TIME";
  const periodKey = req.query.periodKey || "ALL";

  const performances = await StudentMetricPerformance.find({
    studentId,
    "period.type": periodType,
    "period.key": periodKey,
  })
    .populate("metricId")
    .lean();

  const performanceMap = {};
  for (const perf of performances) {
    if (perf.metricId && perf.metricId._id) {
      performanceMap[perf.metricId._id.toString()] = {
        metricId: perf.metricId._id,
        name: perf.metricId.name,
        slug: perf.metricId.slug,
        type: perf.metricId.type,
        accuracy: perf.accuracy,
        percentage: perf.percentage,
        questionsAttempted: perf.questionsAttempted,
        questionsCorrect: perf.questionsCorrect,
        obtainedMarks: perf.obtainedMarks,
        totalMarks: perf.totalMarks,
        tagBreakdown: perf.tagBreakdown || [],
      };
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { performanceMap, performances },
      "Student tree performance fetched successfully"
    )
  );
});
