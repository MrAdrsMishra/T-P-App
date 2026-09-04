import { Metric } from "../../models/analytics-models/Metric.models.js";
import { StudentMetricPerformance } from "../../models/analytics-models/StudentMetricPerformance.models.js";
import { RankingSnapshot } from "../../models/analytics-models/RankingSnapshot.models.js";
import { Student } from "../../models/user-models/student.models.js";

/**
 * Rollup performance metrics upward through the Metric hierarchy.
 * Example: Prepositions -> Grammar -> English -> (Overall)
 */
export const recordAnswerAndRollup = async ({
  studentId,
  metrics = [],
  tags = [],
  isCorrect,
  marksObtained,
  totalMarks,
  period = { type: "ALL_TIME", key: "ALL" },
}) => {
  const student = await Student.findById(studentId).select("course stream branch batch").lean();
  const academic = student ? {
    course: student.course,
    stream: student.stream,
    branch: student.branch,
    batch: student.batch,
  } : {};

  for (const item of metrics) {
    const metricId = item.metricId || item;
    const metric = await Metric.findById(metricId);
    if (!metric) continue;

    // Collect target metric and all its ancestors for upward rollup
    const metricChain = [metric._id, ...(metric.ancestors || [])];

    for (const mId of metricChain) {
      let perf = await StudentMetricPerformance.findOne({
        studentId,
        metricId: mId,
        "period.type": period.type,
        "period.key": period.key,
      });

      const newAttempted = (perf?.questionsAttempted || 0) + 1;
      const newCorrect = (perf?.questionsCorrect || 0) + (isCorrect ? 1 : 0);
      const newObtained = (perf?.obtainedMarks || 0) + marksObtained;
      const newTotalMarks = (perf?.totalMarks || 0) + totalMarks;
      const newAccuracy = newAttempted > 0 ? (newCorrect / newAttempted) * 100 : 0;
      const newPercentage = newTotalMarks > 0 ? (newObtained / newTotalMarks) * 100 : 0;

      // Update tag breakdown
      let updatedTagBreakdown = perf?.tagBreakdown ? [...perf.tagBreakdown] : [];
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          const existingIndex = updatedTagBreakdown.findIndex((t) => t.tag === tag);
          if (existingIndex >= 0) {
            const tItem = updatedTagBreakdown[existingIndex];
            const tAttempted = (tItem.attempted || 0) + 1;
            const tCorrect = (tItem.correct || 0) + (isCorrect ? 1 : 0);
            const tAccuracy = Math.round((tCorrect / tAttempted) * 100);
            const tStatus = tAccuracy < 60 ? "WEAK" : tAccuracy > 80 ? "STRONG" : "AVERAGE";

            updatedTagBreakdown[existingIndex] = {
              tag,
              attempted: tAttempted,
              correct: tCorrect,
              accuracy: tAccuracy,
              status: tStatus,
            };
          } else {
            const tAccuracy = isCorrect ? 100 : 0;
            const tStatus = tAccuracy < 60 ? "WEAK" : tAccuracy > 80 ? "STRONG" : "AVERAGE";
            updatedTagBreakdown.push({
              tag,
              attempted: 1,
              correct: isCorrect ? 1 : 0,
              accuracy: tAccuracy,
              status: tStatus,
            });
          }
        }
      }

      await StudentMetricPerformance.findOneAndUpdate(
        {
          studentId,
          metricId: mId,
          "period.type": period.type,
          "period.key": period.key,
        },
        {
          $set: {
            academic,
            questionsAttempted: newAttempted,
            questionsCorrect: newCorrect,
            obtainedMarks: newObtained,
            totalMarks: newTotalMarks,
            accuracy: Math.round(newAccuracy * 100) / 100,
            percentage: Math.round(newPercentage * 100) / 100,
            tagBreakdown: updatedTagBreakdown,
            lastAttemptAt: new Date(),
          },
          $inc: { attemptsCount: 1 },
        },
        { upsert: true, new: true }
      );
    }
  }
};

/**
 * Recalculate ranking snapshots for a given metric, scope, and period.
 * Supports dense ranking (default) or competition ranking tie strategies.
 */
export const calculateRankingSnapshots = async ({
  metricId,
  scopeType = "GLOBAL",
  scopeId = "ALL",
  period = { type: "ALL_TIME", key: "ALL" },
  tieStrategy = "dense", // "dense" or "competition"
}) => {
  // Build student match filter based on scope
  const studentMatch = {};
  if (scopeType === "COURSE") studentMatch.course = scopeId;
  if (scopeType === "STREAM") studentMatch.stream = scopeId;
  if (scopeType === "BRANCH") studentMatch.branch = scopeId;
  if (scopeType === "BATCH") studentMatch.batch = scopeId;

  const eligibleStudents = await Student.find(studentMatch).select("_id").lean();
  const studentIds = eligibleStudents.map((s) => s._id);

  if (studentIds.length === 0) return [];

  // Fetch performance for eligible students
  const performances = await StudentMetricPerformance.find({
    metricId,
    studentId: { $in: studentIds },
    "period.type": period.type,
    "period.key": period.key,
  })
    .sort({ percentage: -1, questionsCorrect: -1, obtainedMarks: -1 })
    .lean();

  const totalParticipants = performances.length;
  const snapshots = [];

  let currentRank = 1;
  let prevScore = null;

  for (let i = 0; i < performances.length; i++) {
    const perf = performances[i];
    const score = perf.percentage;

    if (prevScore !== null && score < prevScore) {
      if (tieStrategy === "dense") {
        currentRank += 1;
      } else {
        currentRank = i + 1; // competition ranking
      }
    }
    prevScore = score;

    snapshots.push({
      metricId,
      studentId: perf.studentId,
      scope: { type: scopeType, id: scopeId },
      period,
      score,
      rank: currentRank,
      totalParticipants,
      calculatedAt: new Date(),
      version: 1,
    });
  }

  // Clear existing snapshots for this metric + scope + period and insert new derived snapshots
  await RankingSnapshot.deleteMany({
    metricId,
    "scope.type": scopeType,
    "scope.id": scopeId,
    "period.type": period.type,
    "period.key": period.key,
  });

  if (snapshots.length > 0) {
    await RankingSnapshot.insertMany(snapshots);
  }

  return snapshots;
};

/**
 * Generic API query for rankings (e.g. GET /rankings?metricId=...&scopeType=BRANCH&scopeId=CSE-AIML&rankFrom=11&rankTo=25)
 */
export const getRankings = async ({
  metricId,
  scopeType = "GLOBAL",
  scopeId = "ALL",
  period = { type: "ALL_TIME", key: "ALL" },
  rankFrom,
  rankTo,
  page = 1,
  limit = 20,
}) => {
  const query = {
    metricId,
    "scope.type": scopeType,
    "scope.id": scopeId,
    "period.type": period.type,
    "period.key": period.key,
  };

  let count = await RankingSnapshot.countDocuments(query);
  if (count === 0 && metricId) {
    // Dynamically calculate snapshots if not precomputed
    await calculateRankingSnapshots({
      metricId,
      scopeType,
      scopeId,
      period,
    });
    count = await RankingSnapshot.countDocuments(query);
  }

  if (rankFrom !== undefined || rankTo !== undefined) {
    query.rank = {};
    if (rankFrom !== undefined && rankFrom !== null && rankFrom !== "") query.rank.$gte = Number(rankFrom);
    if (rankTo !== undefined && rankTo !== null && rankTo !== "") query.rank.$lte = Number(rankTo);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const snapshots = await RankingSnapshot.find(query)
    .sort({ rank: 1 })
    .skip(skip)
    .limit(Number(limit))
    .populate({
      path: "studentId",
      select: "fullName enrollment course stream branch batch photo",
    })
    .populate({
      path: "metricId",
      select: "name slug type",
    })
    .lean();

  const total = await RankingSnapshot.countDocuments(query);

  const rankingsWithPercentile = snapshots.map((s) => {
    const totalP = s.totalParticipants || 1;
    const percentile = totalP > 1
      ? Math.round((((totalP - s.rank + 1) / totalP) * 100) * 10) / 10
      : 100;
    return {
      ...s,
      percentile,
    };
  });

  return {
    rankings: rankingsWithPercentile,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

