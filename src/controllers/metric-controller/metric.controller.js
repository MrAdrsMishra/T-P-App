import { Metric } from "../../models/analytics-models/Metric.models.js";
import { StudentMetricPerformance } from "../../models/analytics-models/StudentMetricPerformance.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Build a nested metric tree from a flat list of metrics
 */
const buildMetricTree = (metrics, parentId = null) => {
  return metrics
    .filter((m) => String(m.parentId) === String(parentId) || (parentId === null && !m.parentId))
    .map((m) => ({
      _id: m._id,
      name: m.name,
      slug: m.slug,
      type: m.type,
      parentId: m.parentId,
      ancestors: m.ancestors,
      isActive: m.isActive,
      children: buildMetricTree(metrics, m._id),
    }));
};

/**
 * GET /api/v1/metrics
 * Returns the complete hierarchical metric tree or root domain nodes.
 */
export const getMetricTreeController = asyncHandler(async (req, res) => {
  const metrics = await Metric.find({ isActive: true }).lean();
  const tree = buildMetricTree(metrics, null);
  return res.status(200).json(new ApiResponse(200, { tree, flat: metrics }, "Metric tree fetched successfully"));
});

/**
 * GET /api/v1/metrics/:metricId/diagnostics
 * Returns weak and strong micro-topics (tagBreakdown) for the authenticated student.
 */
export const getTagDiagnosticsController = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  const { metricId } = req.params;

  if (!studentId) {
    throw new ApiError(401, "Unauthorized");
  }

  const query = { studentId };
  if (metricId && metricId !== "all") {
    query.metricId = metricId;
  }

  const performances = await StudentMetricPerformance.find(query).lean();

  const tagMap = new Map();

  for (const perf of performances) {
    if (perf.tagBreakdown && Array.isArray(perf.tagBreakdown)) {
      for (const t of perf.tagBreakdown) {
        if (!tagMap.has(t.tag)) {
          tagMap.set(t.tag, { tag: t.tag, attempted: 0, correct: 0 });
        }
        const existing = tagMap.get(t.tag);
        existing.attempted += t.attempted || 0;
        existing.correct += t.correct || 0;
      }
    }
  }

  const tags = Array.from(tagMap.values()).map((t) => {
    const accuracy = t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0;
    const status = accuracy < 60 ? "WEAK" : accuracy > 80 ? "STRONG" : "AVERAGE";
    return {
      tag: t.tag,
      attempted: t.attempted,
      correct: t.correct,
      accuracy,
      status,
    };
  });

  const weakTopics = tags.filter((t) => t.accuracy < 60);
  const strongTopics = tags.filter((t) => t.accuracy >= 80);
  const averageTopics = tags.filter((t) => t.accuracy >= 60 && t.accuracy < 80);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allTags: tags,
        weakTopics,
        strongTopics,
        averageTopics,
      },
      "Tag diagnostics fetched successfully"
    )
  );
});
