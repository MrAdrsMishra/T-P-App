import { Student } from "../../models/user-models/student.models.js";
import { Metric } from "../../models/analytics-models/Metric.models.js";
import { StudentMetricPerformance } from "../../models/analytics-models/StudentMetricPerformance.models.js";
import { RankingSnapshot } from "../../models/analytics-models/RankingSnapshot.models.js";
import { ScoringProfile } from "../../models/analytics-models/ScoringProfile.models.js";
import { AssessmentAttempt } from "../../models/test-models/AssessmentAttempt.models.js";
import { TestAttempt } from "../../models/test-models/testAttempts.models.js";
import { Answer } from "../../models/test-models/Answer.models.js";
import { Question } from "../../models/test-models/questions.models.js";
import { Test } from "../../models/test-models/test.models.js";

// Helper: Calculate percentile from rank and total participants
const calcPercentile = (rank, total) => {
  if (!total || total <= 1) return 100;
  const p = ((total - rank + 1) / total) * 100;
  return Math.round(p * 10) / 10;
};

// Helper: Recursive tree builder for metrics
const buildMetricSubtree = (node, performanceMap) => {
  const perf = performanceMap[node._id.toString()] || {
    accuracy: 0,
    percentage: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
    obtainedMarks: 0,
    totalMarks: 0,
  };

  const children = (node.children || []).map((child) =>
    buildMetricSubtree(child, performanceMap)
  );

  return {
    _id: node._id,
    name: node.name,
    slug: node.slug,
    type: node.type,
    score: perf.obtainedMarks,
    percentage: perf.percentage,
    accuracy: perf.accuracy,
    attempted: perf.questionsAttempted,
    correct: perf.questionsCorrect,
    totalMarks: perf.totalMarks,
    children,
  };
};

/**
 * STUDENT ANALYTICS SERVICES
 */

// 1. Overall Student Analytics Summary
export const getStudentSummaryService = async (studentId) => {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  // Fetch attempts from TestAttempt or AssessmentAttempt
  const attempts = await TestAttempt.find({
    studentId,
    status: { $in: ["submitted", "evaluated"] },
  })
    .sort({ attemptDate: 1 })
    .lean();

  const totalAssessments = attempts.length;
  let questionsAttempted = 0;
  let totalScoreObtained = 0;
  let totalMaxScore = 0;
  let totalCorrect = 0;

  attempts.forEach((att) => {
    questionsAttempted += att.totalQuestions || 0;
    totalScoreObtained += att.testScore || 0;
    totalMaxScore += att.maxScore || (att.totalQuestions * 10) || 0;
    totalCorrect += att.correctAnswers || 0;
  });

  const accuracy = questionsAttempted > 0
    ? Math.round((totalCorrect / questionsAttempted) * 1000) / 10
    : 0;

  const overallScore = totalMaxScore > 0
    ? Math.round((totalScoreObtained / totalMaxScore) * 1000) / 10
    : 0;

  // Improvement percentage calculation (comparing recent half vs earlier half of attempts)
  let improvementPercentage = 0;
  if (attempts.length >= 2) {
    const mid = Math.floor(attempts.length / 2);
    const earlier = attempts.slice(0, mid);
    const recent = attempts.slice(mid);

    const earlierAvg = earlier.reduce((acc, a) => acc + (a.maxScore ? (a.testScore / a.maxScore) * 100 : 0), 0) / earlier.length;
    const recentAvg = recent.reduce((acc, a) => acc + (a.maxScore ? (a.testScore / a.maxScore) * 100 : 0), 0) / recent.length;

    improvementPercentage = Math.round((recentAvg - earlierAvg) * 10) / 10;
  }

  // Global ranking snapshot
  const globalSnapshot = await RankingSnapshot.findOne({
    studentId,
    "scope.type": "GLOBAL",
    "period.type": "ALL_TIME",
  })
    .sort({ calculatedAt: -1 })
    .lean();

  const overallRank = globalSnapshot ? globalSnapshot.rank : 1;
  const totalParticipants = globalSnapshot ? globalSnapshot.totalParticipants : 1;
  const percentile = calcPercentile(overallRank, totalParticipants);

  // Dynamic Category Performance map
  const topMetrics = await Metric.find({ parentId: null, isActive: true }).lean();
  const metricPerfs = await StudentMetricPerformance.find({
    studentId,
    "period.type": "ALL_TIME",
  }).lean();

  const categoryPerformance = {};
  for (const m of topMetrics) {
    const match = metricPerfs.find((p) => p.metricId.toString() === m._id.toString());
    categoryPerformance[m.name] = match ? match.percentage : 0;
  }

  return {
    overallScore,
    overallRank,
    percentile,
    totalAssessments,
    questionsAttempted,
    accuracy,
    improvementPercentage,
    categoryPerformance,
  };
};

// 2. Hierarchical Performance Tree
export const getHierarchicalPerformanceService = async (studentId) => {
  const allMetrics = await Metric.find({ isActive: true }).lean();
  const perfs = await StudentMetricPerformance.find({
    studentId,
    "period.type": "ALL_TIME",
  }).lean();

  const performanceMap = {};
  perfs.forEach((p) => {
    performanceMap[p.metricId.toString()] = p;
  });

  // Build tree nodes
  const nodeMap = {};
  allMetrics.forEach((m) => {
    nodeMap[m._id.toString()] = { ...m, children: [] };
  });

  const tree = [];
  allMetrics.forEach((m) => {
    if (m.parentId && nodeMap[m.parentId.toString()]) {
      nodeMap[m.parentId.toString()].children.push(nodeMap[m._id.toString()]);
    } else {
      tree.push(nodeMap[m._id.toString()]);
    }
  });

  const performanceTree = tree.map((root) => buildMetricSubtree(root, performanceMap));

  return { performanceTree };
};

// 3. Weak / Average / Strong Skills Classification
export const getSkillsClassificationService = async (
  studentId,
  { weakThreshold = 60, strongThreshold = 80 } = {}
) => {
  const metricPerfs = await StudentMetricPerformance.find({
    studentId,
    "period.type": "ALL_TIME",
  })
    .populate("metricId")
    .lean();

  const weakSkills = [];
  const averageSkills = [];
  const strongSkills = [];

  const processedMetricIds = new Set();

  metricPerfs.forEach((p) => {
    if (!p.metricId) return;
    processedMetricIds.add(p.metricId._id.toString());

    const item = {
      metricId: p.metricId._id,
      name: p.metricId.name,
      slug: p.metricId.slug,
      type: p.metricId.type,
      accuracy: p.accuracy,
      percentage: p.percentage,
      attempted: p.questionsAttempted,
      correct: p.questionsCorrect,
    };

    if (p.accuracy < weakThreshold) {
      weakSkills.push(item);
    } else if (p.accuracy > strongThreshold) {
      strongSkills.push(item);
    } else {
      averageSkills.push(item);
    }

    // Process tag breakdown
    if (p.tagBreakdown && p.tagBreakdown.length > 0) {
      p.tagBreakdown.forEach((t) => {
        const tagItem = {
          name: t.tag,
          tag: t.tag,
          accuracy: t.accuracy,
          attempted: t.attempted,
          correct: t.correct,
        };

        if (t.accuracy < weakThreshold) {
          if (!weakSkills.some((s) => s.name === t.tag)) weakSkills.push(tagItem);
        } else if (t.accuracy > strongThreshold) {
          if (!strongSkills.some((s) => s.name === t.tag)) strongSkills.push(tagItem);
        } else {
          if (!averageSkills.some((s) => s.name === t.tag)) averageSkills.push(tagItem);
        }
      });
    }
  });

  return {
    thresholds: { weakThreshold, strongThreshold },
    weakSkills,
    averageSkills,
    strongSkills,
  };
};

// 4. Performance Trends
export const getPerformanceTrendsService = async (studentId) => {
  const attempts = await TestAttempt.find({
    studentId,
    status: { $in: ["submitted", "evaluated"] },
  })
    .sort({ attemptDate: 1 })
    .lean();

  const trendData = attempts.map((att, idx) => {
    const percentage = att.maxScore
      ? Math.round((att.testScore / att.maxScore) * 1000) / 10
      : 0;
    const accuracy = att.totalQuestions
      ? Math.round((att.correctAnswers / att.totalQuestions) * 1000) / 10
      : 0;

    return {
      attemptNumber: idx + 1,
      testId: att.testId,
      date: att.attemptDate || att.createdAt,
      score: att.testScore,
      percentage,
      accuracy,
    };
  });

  return { trends: trendData };
};

// 5. Coding Analytics
export const getCodingAnalyticsService = async (studentId) => {
  const codingMetrics = await Metric.find({
    $or: [{ slug: "coding" }, { ancestors: { $in: [await Metric.findOne({ slug: "coding" }).then(m => m?._id)] } }],
  }).lean();

  const metricIds = codingMetrics.map((m) => m._id);

  const perfs = await StudentMetricPerformance.find({
    studentId,
    metricId: { $in: metricIds },
    "period.type": "ALL_TIME",
  })
    .populate("metricId")
    .lean();

  const languagePerformance = {};
  const topicPerformance = {};
  let totalProblemsSolved = 0;
  let totalAttempted = 0;

  perfs.forEach((p) => {
    if (!p.metricId) return;
    if (p.metricId.type === "SUB_CATEGORY" || p.metricId.type === "CATEGORY") {
      languagePerformance[p.metricId.name] = p.accuracy;
    } else if (p.metricId.type === "TOPIC" || p.metricId.type === "SKILL") {
      topicPerformance[p.metricId.name] = p.accuracy;
    }
    totalProblemsSolved += p.questionsCorrect;
    totalAttempted += p.questionsAttempted;
  });

  const accuracy = totalAttempted > 0 ? Math.round((totalProblemsSolved / totalAttempted) * 1000) / 10 : 0;

  return {
    problemsSolved: totalProblemsSolved,
    totalAttempted,
    accuracy,
    languagePerformance,
    topicPerformance,
  };
};

// 6. Placement Readiness Calculation
export const getPlacementReadinessService = async (studentId) => {
  let profile = await ScoringProfile.findOne({ isDefault: true }).lean();
  if (!profile) {
    // Fallback if no profile exists
    profile = await ScoringProfile.findOne().lean();
  }

  const metricPerfs = await StudentMetricPerformance.find({
    studentId,
    "period.type": "ALL_TIME",
  })
    .populate("metricId")
    .lean();

  let readinessScore = 0;
  let totalWeight = 0;
  const breakdown = [];

  if (profile && profile.weights && profile.weights.length > 0) {
    for (const w of profile.weights) {
      const match = metricPerfs.find((p) => p.metricId && p.metricId._id.toString() === w.metricId.toString());
      const score = match ? match.percentage : 0;
      readinessScore += (score * w.weight) / 100;
      totalWeight += w.weight;

      const metric = await Metric.findById(w.metricId).lean();
      breakdown.push({
        metricName: metric ? metric.name : "Category",
        weight: w.weight,
        score,
      });
    }
  } else {
    // Dynamic default breakdown across top-level categories
    const topMetrics = await Metric.find({ parentId: null, isActive: true }).lean();
    const defaultWeight = topMetrics.length > 0 ? 100 / topMetrics.length : 100;

    for (const m of topMetrics) {
      const match = metricPerfs.find((p) => p.metricId && p.metricId._id.toString() === m._id.toString());
      const score = match ? match.percentage : 0;
      readinessScore += (score * defaultWeight) / 100;
      totalWeight += defaultWeight;

      breakdown.push({
        metricName: m.name,
        weight: Math.round(defaultWeight),
        score,
      });
    }
  }

  readinessScore = Math.round(readinessScore * 10) / 10;

  return {
    readinessScore,
    profileName: profile ? profile.name : "Default Profile",
    breakdown,
  };
};

// 7. Peer Comparison
export const getPeerComparisonService = async (studentId) => {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  // Student summary
  const summary = await getStudentSummaryService(studentId);

  // Group averages across scope levels
  const calcScopeAvg = async (matchFilter) => {
    const peerStudents = await Student.find(matchFilter).select("_id").lean();
    const ids = peerStudents.map((s) => s._id);

    if (ids.length === 0) return { avgScore: 0, topScore: 0 };

    const topMetric = await Metric.findOne({ parentId: null, isActive: true }).lean();
    if (!topMetric) return { avgScore: 0, topScore: 0 };

    const perfs = await StudentMetricPerformance.find({
      studentId: { $in: ids },
      "period.type": "ALL_TIME",
    }).lean();

    if (perfs.length === 0) return { avgScore: 0, topScore: 0 };

    const scores = perfs.map((p) => p.percentage);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const topScore = Math.max(...scores);

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      topScore: Math.round(topScore * 10) / 10,
    };
  };

  const branchAvg = student.branch ? await calcScopeAvg({ branch: student.branch }) : { avgScore: 0, topScore: 0 };
  const batchAvg = student.batch ? await calcScopeAvg({ batch: student.batch }) : { avgScore: 0, topScore: 0 };
  const streamAvg = student.stream ? await calcScopeAvg({ stream: student.stream }) : { avgScore: 0, topScore: 0 };
  const courseAvg = student.course ? await calcScopeAvg({ course: student.course }) : { avgScore: 0, topScore: 0 };

  return {
    myScore: summary ? summary.overallScore : 0,
    branchAvg: branchAvg.avgScore,
    batchAvg: batchAvg.avgScore,
    streamAvg: streamAvg.avgScore,
    courseAvg: courseAvg.avgScore,
    topScore: branchAvg.topScore || batchAvg.topScore || 100,
  };
};

/**
 * ADMIN ANALYTICS SERVICES
 */

// 8. Admin Institution Overview
export const getAdminOverviewService = async () => {
  const totalStudents = await Student.countDocuments();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeStudents = await Student.countDocuments({
    $or: [{ lastTestDate: { $gte: thirtyDaysAgo } }, { updatedAt: { $gte: thirtyDaysAgo } }],
  });

  const totalAssessments = await Test.countDocuments();
  const completedAttempts = await TestAttempt.countDocuments({ status: { $in: ["submitted", "evaluated"] } });

  const attempts = await TestAttempt.find({ status: { $in: ["submitted", "evaluated"] } }).lean();

  let totalScoreSum = 0;
  let maxScoreSum = 0;
  let questionsAttempted = 0;
  let questionsCorrect = 0;

  attempts.forEach((a) => {
    totalScoreSum += a.testScore || 0;
    maxScoreSum += a.maxScore || (a.totalQuestions * 10) || 0;
    questionsAttempted += a.totalQuestions || 0;
    questionsCorrect += a.correctAnswers || 0;
  });

  const averageScore = maxScoreSum > 0 ? Math.round((totalScoreSum / maxScoreSum) * 1000) / 10 : 0;
  const averageAccuracy = questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 1000) / 10 : 0;
  const participationRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 1000) / 10 : 0;

  return {
    totalStudents,
    activeStudents,
    totalAssessments,
    completedAssessments: completedAttempts,
    questionsAttempted,
    averageScore,
    averageAccuracy,
    participationRate,
  };
};

// 9. Academic Performance Breakdown (Course / Stream / Branch / Batch)
export const getAcademicPerformanceService = async () => {
  const students = await Student.find({}).lean();

  const aggregateDimension = (field) => {
    const map = {};
    students.forEach((s) => {
      const key = s[field] || "Unspecified";
      if (!map[key]) map[key] = { count: 0, studentIds: [] };
      map[key].count += 1;
      map[key].studentIds.push(s._id);
    });
    return map;
  };

  const computeGroupAverages = async (dimMap) => {
    const result = {};
    for (const [key, val] of Object.entries(dimMap)) {
      const perfs = await StudentMetricPerformance.find({
        studentId: { $in: val.studentIds },
        "period.type": "ALL_TIME",
      }).lean();

      if (perfs.length === 0) {
        result[key] = 0;
      } else {
        const avg = perfs.reduce((acc, p) => acc + p.percentage, 0) / perfs.length;
        result[key] = Math.round(avg * 10) / 10;
      }
    }
    return result;
  };

  const coursePerformance = await computeGroupAverages(aggregateDimension("course"));
  const streamPerformance = await computeGroupAverages(aggregateDimension("stream"));
  const branchPerformance = await computeGroupAverages(aggregateDimension("branch"));
  const batchPerformance = await computeGroupAverages(aggregateDimension("batch"));

  return {
    coursePerformance,
    streamPerformance,
    branchPerformance,
    batchPerformance,
  };
};

// 10. Topic Heatmap (HIGH PRIORITY ADMIN FEATURE)
export const getTopicHeatmapService = async () => {
  const topics = await Metric.find({ type: { $in: ["TOPIC", "SUB_CATEGORY", "SKILL"] }, isActive: true }).lean();

  const heatmap = [];

  for (const t of topics) {
    const perfs = await StudentMetricPerformance.find({
      metricId: t._id,
      "period.type": "ALL_TIME",
    }).lean();

    if (perfs.length === 0) {
      heatmap.push({
        topicId: t._id,
        topicName: t.name,
        slug: t.slug,
        type: t.type,
        averageScore: 0,
        averageAccuracy: 0,
        totalStudents: 0,
        weakStudentsCount: 0,
        weakStudentsPercentage: 0,
      });
      continue;
    }

    const totalStudents = perfs.length;
    const avgScore = perfs.reduce((acc, p) => acc + p.percentage, 0) / totalStudents;
    const avgAccuracy = perfs.reduce((acc, p) => acc + p.accuracy, 0) / totalStudents;
    const weakCount = perfs.filter((p) => p.accuracy < 60).length;
    const weakPercentage = Math.round((weakCount / totalStudents) * 1000) / 10;

    heatmap.push({
      topicId: t._id,
      topicName: t.name,
      slug: t.slug,
      type: t.type,
      averageScore: Math.round(avgScore * 10) / 10,
      averageAccuracy: Math.round(avgAccuracy * 10) / 10,
      totalStudents,
      weakStudentsCount: weakCount,
      weakStudentsPercentage: weakPercentage,
    });
  }

  return { heatmap };
};

// 11. Question Analytics
export const getQuestionAnalyticsService = async () => {
  const questions = await Question.find({}).populate("metrics.metricId").lean();

  const analyticsList = [];

  for (const q of questions) {
    const answers = await Answer.find({ questionId: q._id }).lean();

    const attemptCount = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const incorrectCount = answers.filter((a) => !a.isCorrect && a.response !== null && a.response !== undefined).length;
    const skippedCount = attemptCount - (correctCount + incorrectCount);
    const correctPercentage = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 1000) / 10 : 0;

    const totalTime = answers.reduce((acc, a) => acc + (a.timeTakenMs || 0), 0);
    const averageTime = attemptCount > 0 ? Math.round((totalTime / attemptCount) / 1000) : 0;

    // Common wrong response frequency
    const wrongResponses = {};
    answers.filter((a) => !a.isCorrect && a.response).forEach((a) => {
      const respStr = String(a.response);
      wrongResponses[respStr] = (wrongResponses[respStr] || 0) + 1;
    });

    let mostCommonWrongAnswer = "N/A";
    let maxCount = 0;
    for (const [ans, c] of Object.entries(wrongResponses)) {
      if (c > maxCount) {
        maxCount = c;
        mostCommonWrongAnswer = ans;
      }
    }

    analyticsList.push({
      questionId: q._id,
      problemStatement: q.problemStatement,
      difficulty: q.difficulty,
      questionType: q.questionType,
      tags: q.tags,
      attemptCount,
      correctCount,
      incorrectCount,
      skippedCount,
      correctPercentage,
      averageTime,
      mostCommonWrongAnswer,
    });
  }

  return { questions: analyticsList };
};

// 12. Assessment Analytics Admin
export const getAssessmentAnalyticsAdminService = async (testId) => {
  let attempts = [];
  if (testId) {
    attempts = await TestAttempt.find({ testId, status: { $in: ["submitted", "evaluated"] } }).lean();
  } else {
    attempts = await TestAttempt.find({ status: { $in: ["submitted", "evaluated"] } }).lean();
  }

  const participants = attempts.length;
  if (participants === 0) {
    return {
      participants: 0,
      completionRate: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averageAccuracy: 0,
      averageTime: 0,
    };
  }

  const scores = attempts.map((a) => a.testScore || 0);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / participants) * 10) / 10;

  const totalQuestions = attempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
  const totalCorrect = attempts.reduce((acc, a) => acc + (a.correctAnswers || 0), 0);
  const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;

  const totalTime = attempts.reduce((acc, a) => acc + (a.timeTaken || 0), 0);
  const averageTime = Math.round(totalTime / participants);

  return {
    participants,
    completionRate: 100,
    averageScore,
    highestScore,
    lowestScore,
    averageAccuracy,
    averageTime,
  };
};

// 13. At-Risk Students Mechanism
export const getAtRiskStudentsService = async ({
  scoreThreshold = 50,
} = {}) => {
  const students = await Student.find({}).lean();
  const atRiskStudents = [];

  for (const s of students) {
    const reasons = [];

    const summary = await getStudentSummaryService(s._id);
    if (!summary) continue;

    if (summary.overallScore < scoreThreshold) {
      reasons.push(`Overall score (${summary.overallScore}%) is below threshold (${scoreThreshold}%)`);
    }

    if (summary.improvementPercentage < -10) {
      reasons.push(`Performance declined by ${Math.abs(summary.improvementPercentage)}% recently`);
    }

    if (summary.totalAssessments === 0) {
      reasons.push("Has not participated in any assessments yet");
    }

    // Check specific critical metrics (Coding, Aptitude, English)
    const skills = await getSkillsClassificationService(s._id);
    if (skills.weakSkills.length >= 3) {
      reasons.push(`Identified with ${skills.weakSkills.length} weak metric areas`);
    }

    if (reasons.length > 0) {
      const riskLevel = reasons.length >= 3 ? "HIGH" : reasons.length === 2 ? "MEDIUM" : "LOW";
      atRiskStudents.push({
        studentId: s._id,
        fullName: s.fullName,
        enrollment: s.enrollment,
        course: s.course,
        branch: s.branch,
        batch: s.batch,
        overallScore: summary.overallScore,
        riskLevel,
        reasons,
      });
    }
  }

  return { atRiskStudents };
};

// 14. Student Improvement Analytics
export const getImprovementAnalyticsService = async () => {
  const students = await Student.find({}).lean();

  let improvingCount = 0;
  let stableCount = 0;
  let decliningCount = 0;

  const studentDetails = [];

  for (const s of students) {
    const summary = await getStudentSummaryService(s._id);
    if (!summary) continue;

    let status = "Stable";
    if (summary.improvementPercentage > 5) {
      status = "Improving";
      improvingCount++;
    } else if (summary.improvementPercentage < -5) {
      status = "Declining";
      decliningCount++;
    } else {
      stableCount++;
    }

    studentDetails.push({
      studentId: s._id,
      fullName: s.fullName,
      status,
      improvementPercentage: summary.improvementPercentage,
    });
  }

  return {
    improvingCount,
    stableCount,
    decliningCount,
    students: studentDetails,
  };
};

// 15. Participation Analytics
export const getParticipationAnalyticsService = async () => {
  const totalStudents = await Student.countDocuments();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeStudents = await Student.countDocuments({
    $or: [{ lastTestDate: { $gte: thirtyDaysAgo } }, { updatedAt: { $gte: thirtyDaysAgo } }],
  });

  const inactiveStudents = Math.max(0, totalStudents - activeStudents);

  const totalAttempts = await TestAttempt.countDocuments({ status: { $in: ["submitted", "evaluated"] } });
  const averageAssessmentsPerStudent = totalStudents > 0 ? Math.round((totalAttempts / totalStudents) * 10) / 10 : 0;

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalAttempts,
    averageAssessmentsPerStudent,
    completionRate: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 1000) / 10 : 0,
  };
};
