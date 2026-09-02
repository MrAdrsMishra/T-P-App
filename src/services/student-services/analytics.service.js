import { Student } from "../../models/user-models/student.models.js";
import { StudentStats } from "../../models/user-models/StudentStats.models.js";
import { TestAttempt } from "../../models/test-models/testAttempts.models.js";
import { TrendAnalysis } from "../../models/user-models/TrendAnalysis.models.js";
import { CodingRankings } from "../../models/user-models/CodingRankings.models.js";
import { cacheService } from "../cache.service.js";

/**
 * Re-computes pre-calculated StudentStats and today's TrendAnalysis snapshot for a single student.
 */
export const computeSingleStudentStats = async (studentId) => {
  const student = await Student.findById(studentId).select("fullName email photo branch batch");
  if (!student) return null;

  const attempts = await TestAttempt.find({ studentId, status: { $in: ["submitted", "evaluated"] } })
    .sort({ attemptDate: 1 });

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalScoreObtained = 0;
  let totalMaxScore = 0;
  let totalTimeSpentMinutes = 0;

  const subjectMap = new Map();
  const categoryMap = new Map();
  const difficultyMap = {
    easy: { attempts: 0, correct: 0, accuracy: 0 },
    medium: { attempts: 0, correct: 0, accuracy: 0 },
    hard: { attempts: 0, correct: 0, accuracy: 0 }
  };

  const dailyTrendMap = new Map();

  let currentStreak = 0;
  let longestStreak = 0;
  let lastAttemptDateStr = null;

  attempts.forEach((att) => {
    totalQuestionsAttempted += att.totalQuestions || 0;
    totalCorrect += att.correctAnswers || 0;
    totalScoreObtained += att.testScore || 0;
    totalMaxScore += att.maxScore || (att.totalQuestions * 10) || 0;
    totalTimeSpentMinutes += Math.round((att.timeTaken || 0) / 60);

    // Date calculations for trends & streaks
    const attDate = new Date(att.attemptDate);
    const dateStr = attDate.toISOString().split("T")[0];

    // Daily breakdown tracking
    if (!dailyTrendMap.has(dateStr)) {
      dailyTrendMap.set(dateStr, {
        date: dateStr,
        questionsCount: 0,
        correctCount: 0,
        score: 0,
        timeSpent: 0,
        subjects: new Map(),
        categories: new Map()
      });
    }
    const dayData = dailyTrendMap.get(dateStr);
    dayData.questionsCount += att.totalQuestions || 0;
    dayData.correctCount += att.correctAnswers || 0;
    dayData.score += att.testScore || 0;
    dayData.timeSpent += Math.round((att.timeTaken || 0) / 60);

    // Streak calculation
    if (lastAttemptDateStr !== dateStr) {
      if (lastAttemptDateStr) {
        const prev = new Date(lastAttemptDateStr);
        const curr = new Date(dateStr);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      lastAttemptDateStr = dateStr;
    }

    // Process category scores
    if (att.categoryScores && att.categoryScores.size) {
      for (const [catName, catData] of att.categoryScores.entries()) {
        if (!categoryMap.has(catName)) {
          categoryMap.set(catName, { attempts: 0, correct: 0, accuracy: 0, score: 0, timeSpent: 0 });
        }
        const existing = categoryMap.get(catName);
        existing.attempts += catData.total || 0;
        existing.correct += catData.correct || 0;
        existing.score += catData.scoreObtained || 0;
        existing.accuracy = existing.attempts ? Math.round((existing.correct / existing.attempts) * 1000) / 10 : 0;
      }
    }

    // Process question-level answers if present
    if (att.answers && att.answers.length) {
      att.answers.forEach((ans) => {
        const cat = ans.category || att.testCategory || "MCQ";
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { attempts: 0, correct: 0, accuracy: 0, score: 0, timeSpent: 0 });
        }
        const catObj = categoryMap.get(cat);
        catObj.attempts += 1;
        if (ans.isCorrect) catObj.correct += 1;
        catObj.score += ans.scoreObtained || 0;
        catObj.timeSpent += Math.round((ans.timeTaken || 0) / 60);
        catObj.accuracy = catObj.attempts ? Math.round((catObj.correct / catObj.attempts) * 1000) / 10 : 0;

        const diff = ans.difficulty || "medium";
        if (difficultyMap[diff]) {
          difficultyMap[diff].attempts += 1;
          if (ans.isCorrect) difficultyMap[diff].correct += 1;
        }
      });
    }

    // Process subject scores
    if (att.subjectScores && att.subjectScores.length) {
      att.subjectScores.forEach((sub) => {
        const sKey = sub.subjectId ? sub.subjectId.toString() : (sub.subjectName || "General");
        if (!subjectMap.has(sKey)) {
          subjectMap.set(sKey, {
            subjectId: sub.subjectId || null,
            subjectName: sub.subjectName || "General",
            scoreObtained: 0,
            maxMarks: 0,
            attempts: 0,
            timeSpent: 0
          });
        }
        const sObj = subjectMap.get(sKey);
        sObj.scoreObtained += sub.scoreObtained || 0;
        sObj.maxMarks += sub.maxMarks || 0;
        sObj.attempts += 1;
        sObj.timeSpent += Math.round((sub.timeTaken || 0) / 60);
      });
    }
  });

  // Finalize difficulty accuracies
  Object.keys(difficultyMap).forEach((d) => {
    const item = difficultyMap[d];
    item.accuracy = item.attempts ? Math.round((item.correct / item.attempts) * 1000) / 10 : 0;
  });

  // Calculate overall accuracy & averages
  const overallAccuracy = totalQuestionsAttempted
    ? Math.round((totalCorrect / totalQuestionsAttempted) * 1000) / 10
    : 0;
  const avgScore = attempts.length ? Math.round((totalScoreObtained / attempts.length) * 10) / 10 : 0;

  // Process subjects array for schema
  const subjectsArray = Array.from(subjectMap.values()).map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    avgScore: s.attempts ? Math.round((s.scoreObtained / s.attempts) * 10) / 10 : 0,
    accuracy: s.maxMarks ? Math.round((s.scoreObtained / s.maxMarks) * 1000) / 10 : 0,
    attempts: s.attempts,
    timeSpent: s.timeSpent,
    bestRank: 0
  }));

  // Build daily trends (7d, 30d, 90d)
  const allTrendDates = Array.from(dailyTrendMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const buildTrendSlice = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allTrendDates
      .filter((t) => new Date(t.date) >= cutoff)
      .map((t) => ({
        date: t.date,
        accuracy: t.questionsCount ? Math.round((t.correctCount / t.questionsCount) * 1000) / 10 : 0,
        score: t.score,
        questionsCount: t.questionsCount
      }));
  };

  const daily7d = buildTrendSlice(7);
  const daily30d = buildTrendSlice(30);
  const daily90d = buildTrendSlice(90);

  // Consistency & Engagement scores
  const activeDays30d = daily30d.length;
  const consistencyScore = Math.min(100, Math.round((activeDays30d / 30) * 100));
  const engagementScore = Math.min(100, Math.round(overallAccuracy * 0.5 + consistencyScore * 0.5));

  // Upsert StudentStats
  const updatedStats = await StudentStats.findOneAndUpdate(
    { studentId },
    {
      totalTests: attempts.length,
      totalAttempts: totalQuestionsAttempted,
      totalTimeSpent: totalTimeSpentMinutes,
      avgScore,
      overallAccuracy,
      streakInfo: {
        current: currentStreak,
        longest: longestStreak,
        lastUpdated: new Date()
      },
      subjects: subjectsArray,
      categoryStats: categoryMap,
      difficultyStats: difficultyMap,
      performanceTrends: { daily7d, daily30d, daily90d },
      consistencyScore,
      engagementScore,
      lastComputed: new Date()
    },
    { upsert: true, new: true }
  );

  // Upsert today's TrendAnalysis record
  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = dailyTrendMap.get(todayStr) || {
    questionsCount: 0,
    correctCount: 0,
    score: 0,
    timeSpent: 0
  };

  await TrendAnalysis.findOneAndUpdate(
    { studentId, dateString: todayStr },
    {
      date: new Date(),
      metrics: {
        accuracy: todayData.questionsCount ? Math.round((todayData.correctCount / todayData.questionsCount) * 1000) / 10 : 0,
        streak: currentStreak,
        questionsAttempted: todayData.questionsCount,
        timeSpent: todayData.timeSpent,
        totalScore: todayData.score
      },
      categoryBreakdown: categoryMap,
      engagementScore
    },
    { upsert: true, new: true }
  );

  // Update candidate score for ranking
  const accuracyComponent = overallAccuracy * 0.4;
  const speedComponent = totalTimeSpentMinutes ? Math.min(100, (totalQuestionsAttempted / totalTimeSpentMinutes) * 10) * 0.3 : 0;
  const consistencyComponent = consistencyScore * 0.2;
  const challengeComponent = (difficultyMap.hard.correct * 5) * 0.1;

  const compositeScore = Math.round((accuracyComponent + speedComponent + consistencyComponent + challengeComponent) * 10) / 10;

  await CodingRankings.findOneAndUpdate(
    { studentId },
    {
      fullName: student.fullName,
      email: student.email,
      photo: student.photo,
      branch: student.branch || "N/A",
      batch: student.batch || null,
      score: compositeScore,
      accuracyScore: Math.round(accuracyComponent * 10) / 10,
      speedScore: Math.round(speedComponent * 10) / 10,
      consistencyScore: Math.round(consistencyComponent * 10) / 10,
      challengeScore: Math.round(challengeComponent * 10) / 10,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );

  // Invalidate student stats cache
  cacheService.del(`student:${studentId}:stats`);
  cacheService.del(`student:${studentId}:trends`);

  return updatedStats;
};

/**
 * Re-computes all global, branch-wise, batch-wise, and subject/category rankings across all students.
 */
export const recalculateAllRankings = async () => {
  const allRankings = await CodingRankings.find({}).sort({ score: -1 });
  if (!allRankings.length) return;

  // 1. Assign Global Ranks
  for (let i = 0; i < allRankings.length; i++) {
    allRankings[i].globalRank = i + 1;
  }

  // 2. Assign Branch Ranks
  const branchGroups = new Map();
  allRankings.forEach((item) => {
    const b = item.branch || "N/A";
    if (!branchGroups.has(b)) branchGroups.set(b, []);
    branchGroups.get(b).push(item);
  });

  branchGroups.forEach((list) => {
    list.forEach((item, index) => {
      item.branchRank = index + 1;
    });
  });

  // 3. Assign Batch Ranks
  const batchGroups = new Map();
  allRankings.forEach((item) => {
    const b = item.batch || "N/A";
    if (!batchGroups.has(b)) batchGroups.set(b, []);
    batchGroups.get(b).push(item);
  });

  batchGroups.forEach((list) => {
    list.forEach((item, index) => {
      item.batchRank = index + 1;
    });
  });

  // Save all rankings & sync back to StudentStats
  const bulkOps = allRankings.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        globalRank: item.globalRank,
        branchRank: item.branchRank,
        batchRank: item.batchRank,
        lastUpdated: new Date()
      }
    }
  }));

  if (bulkOps.length) {
    await CodingRankings.bulkWrite(bulkOps);
  }

  // Update ranking field in StudentStats
  const statsBulkOps = allRankings.map((item) => ({
    updateOne: {
      filter: { studentId: item.studentId },
      update: {
        bestRank: item.globalRank,
        "ranking.globalRank": item.globalRank,
        "ranking.branchRank": item.branchRank,
        "ranking.batchRank": item.batchRank
      }
    }
  }));

  if (statsBulkOps.length) {
    await StudentStats.bulkWrite(statsBulkOps);
  }

  // Invalidate leaderboard cache
  cacheService.delPattern("leaderboard:*");
  console.log(`[Rankings] Re-calculated rankings for ${allRankings.length} students successfully.`);
};

/**
 * Analytics Query Functions (with automatic Caching)
 */
export const getStudentDashboardStats = async (studentId) => {
  const cacheKey = `student:${studentId}:stats`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  let stats = await StudentStats.findOne({ studentId });
  if (!stats) {
    stats = await computeSingleStudentStats(studentId);
  }

  const ranking = await CodingRankings.findOne({ studentId }).select("globalRank branchRank batchRank score");
  const responseData = {
    stats,
    ranking: ranking || { globalRank: 0, branchRank: 0, batchRank: 0, score: 0 }
  };

  cacheService.set(cacheKey, responseData, 1800); // 30 min cache
  return responseData;
};

export const getSubjectPerformance = async (studentId) => {
  const dashboard = await getStudentDashboardStats(studentId);
  return dashboard.stats?.subjects || [];
};

export const getPerformanceTrends = async (studentId) => {
  const cacheKey = `student:${studentId}:trends`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  const stats = await StudentStats.findOne({ studentId }).select("performanceTrends");
  const trendHistory = await TrendAnalysis.find({ studentId }).sort({ date: 1 }).limit(90);

  const responseData = {
    trends: stats?.performanceTrends || { daily7d: [], daily30d: [], daily90d: [] },
    dailyHistory: trendHistory
  };

  cacheService.set(cacheKey, responseData, 3600); // 1 hr cache
  return responseData;
};

export const getAccuracyMatrix = async (studentId) => {
  const stats = await StudentStats.findOne({ studentId }).select("overallAccuracy difficultyStats categoryStats streakInfo");
  return {
    overallAccuracy: stats?.overallAccuracy || 0,
    difficultyStats: stats?.difficultyStats || {},
    categoryStats: stats?.categoryStats || {},
    streakInfo: stats?.streakInfo || { current: 0, longest: 0 }
  };
};

export const getLeaderboard = async ({ branch, batch, category, limit = 50 }) => {
  const cacheKey = `leaderboard:${branch || "all"}:${batch || "all"}:${category || "all"}:${limit}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  const filter = {};
  if (branch) filter.branch = branch;
  if (batch) filter.batch = batch;

  let sortField = { globalRank: 1 };
  if (branch) sortField = { branchRank: 1 };
  if (batch) sortField = { batchRank: 1 };

  const leaderboard = await CodingRankings.find(filter)
    .sort(sortField)
    .limit(limit)
    .select("studentId fullName photo branch batch globalRank branchRank batchRank score accuracyScore speedScore consistencyScore badges");

  cacheService.set(cacheKey, leaderboard, 900); // 15 min cache
  return leaderboard;
};

export const getPersonalRanking = async (studentId) => {
  const ranking = await CodingRankings.findOne({ studentId });
  if (!ranking) {
    await computeSingleStudentStats(studentId);
    await recalculateAllRankings();
    return await CodingRankings.findOne({ studentId });
  }
  return ranking;
};
