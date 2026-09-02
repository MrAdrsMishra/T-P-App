import { Student } from "../../models/user-models/student.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Test } from "../../models/test-models/test.models.js";
import { TestAttempt } from "../../models/test-models/testAttempts.models.js";
import { Resource } from "../../models/test-models/resource.models.js";
import { QueryMessage } from "../../models/user-models/queryMessage.models.js";
import { PracticeSession } from "../../models/test-models/TestSession.models.js";
import { recordAnswerAndRollup } from "../analytics-services/rankingEngine.service.js";
import {
  getStudentDashboardStats,
  getSubjectPerformance,
  getPerformanceTrends,
  getAccuracyMatrix,
  getLeaderboard,
  getPersonalRanking
} from "./analytics.service.js";

// Submit Test Service with extensible assessment evaluation & real-time delta stats trigger
export const submitTestService = async (testId, answers, studentId, timeTakenSeconds = 0) => {
  console.log("Received test submission:", { testId, studentId, timeTakenSeconds });

  if (!testId || !answers) {
    throw new ApiError(400, "Test ID and answers are required.");
  }

  // Fetch the test details and populate problems
  const test = await Test.findById(testId).populate("problems");

  if (!test) {
    throw new ApiError(404, "Test not found.");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const processedAnswers = [];
  const subjectScoreMap = new Map();
  const categoryScoreMap = new Map();

  const problems = test.problems || [];

  for (let problem of problems) {
    const pId = problem._id ? problem._id.toString() : null;
    const studentAnswer = answers[pId] !== undefined ? answers[pId] : answers[problem._id];
    let category = problem.category || problem.questionType || problem.type || test.category || "MCQ";
    if (category.toLowerCase() === "mcq") category = "MCQ";
    else if (category.toLowerCase() === "coding") category = "Coding";
    else if (category.toLowerCase() === "essay" || category.toLowerCase() === "audio_spoken") category = "Essay";
    else if (category.toLowerCase() === "descriptive") category = "Descriptive";
    const maxMarks = problem.allocatedMark || 10;
    maxPossibleScore += maxMarks;

    let isCorrect = false;
    let scoreObtained = 0;

    if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
      skippedCount += 1;
    } else {
      // Extensible assessment type evaluation strategy
      if (category === "MCQ" || category === "mcq") {
        if (studentAnswer === problem.correctOption || studentAnswer === problem.correctOptionText) {
          isCorrect = true;
          scoreObtained = maxMarks;
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      } else if (category === "Coding" || category === "coding") {
        if (typeof studentAnswer === "object" && studentAnswer.passedCases !== undefined) {
          const ratio = studentAnswer.passedCases / (studentAnswer.totalCases || 1);
          scoreObtained = Math.round(ratio * maxMarks * 10) / 10;
          isCorrect = ratio === 1;
          if (isCorrect) correctCount += 1;
          else wrongCount += 1;
        } else if (studentAnswer === problem.correctOption || studentAnswer.isCorrect) {
          isCorrect = true;
          scoreObtained = maxMarks;
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      } else if (category === "Essay" || category === "essay" || category === "audio_spoken") {
        scoreObtained = studentAnswer.grade || Math.round(maxMarks * 0.7);
        isCorrect = scoreObtained > 0;
        if (isCorrect) correctCount += 1;
        else wrongCount += 1;
      } else {
        if (studentAnswer === problem.correctOption) {
          isCorrect = true;
          scoreObtained = maxMarks;
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      }
    }

    totalScore += scoreObtained;

    // Track answer item
    processedAnswers.push({
      questionId: problem._id,
      category,
      selectedAnswer: studentAnswer,
      isCorrect,
      scoreObtained,
      maxMarks,
      timeTaken: problem.timeTaken || 0,
      difficulty: problem.difficulty || "medium"
    });

    // Dynamic upward metric performance rollup
    const problemMetrics = (problem.metrics && problem.metrics.length > 0)
      ? problem.metrics
      : (problem.metricAncestors || []);

    if (problemMetrics.length > 0) {
      const now = new Date();
      const monthlyKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await recordAnswerAndRollup({
        studentId,
        metrics: problemMetrics,
        tags: problem.tags || [],
        isCorrect,
        marksObtained: scoreObtained,
        totalMarks: maxMarks,
        period: { type: "ALL_TIME", key: "ALL" }
      });
      await recordAnswerAndRollup({
        studentId,
        metrics: problemMetrics,
        tags: problem.tags || [],
        isCorrect,
        marksObtained: scoreObtained,
        totalMarks: maxMarks,
        period: { type: "MONTHLY", key: monthlyKey }
      });
    }

    // Aggregate category scores
    if (!categoryScoreMap.has(category)) {
      categoryScoreMap.set(category, { scoreObtained: 0, maxMarks: 0, correct: 0, total: 0 });
    }
    const catItem = categoryScoreMap.get(category);
    catItem.total += 1;
    catItem.maxMarks += maxMarks;
    catItem.scoreObtained += scoreObtained;
    if (isCorrect) catItem.correct += 1;

    // Aggregate subject scores
    const subId = problem.subject ? problem.subject._id || problem.subject : null;
    const subName = problem.subjectName || (problem.subject && problem.subject.subjectName) || "General";
    const subKey = subId ? subId.toString() : subName;

    if (!subjectScoreMap.has(subKey)) {
      subjectScoreMap.set(subKey, { subjectId: subId, subjectName: subName, scoreObtained: 0, maxMarks: 0, timeTaken: 0 });
    }
    const subItem = subjectScoreMap.get(subKey);
    subItem.scoreObtained += scoreObtained;
    subItem.maxMarks += maxMarks;
  }

  const subjectScoresArray = Array.from(subjectScoreMap.values());

  // Create TestAttempt record
  const attemptRecord = await TestAttempt.create({
    studentId,
    testId,
    testCategory: test.category || "MCQ",
    testScore: totalScore,
    maxScore: maxPossibleScore,
    timeTaken: timeTakenSeconds,
    attemptCount: 1,
    attemptDate: new Date(),
    status: "submitted",
    totalQuestions: problems.length,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    skippedAnswers: skippedCount,
    answers: processedAnswers,
    subjectScores: subjectScoresArray,
    categoryScores: categoryScoreMap
  });

  // Update Student test stats overview
  student.totalTestAppeared = (student.totalTestAppeared || 0) + 1;
  student.lastTestDate = new Date();
  await student.save();

  return {
    attemptId: attemptRecord._id,
    testScore: totalScore,
    maxScore: maxPossibleScore,
    totalQuestions: problems.length,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    skippedAnswers: skippedCount,
    accuracy: problems.length ? Math.round((correctCount / problems.length) * 1000) / 10 : 0
  };
};

// Get Ongoing Test Info Service
export const getOngoingTestInfoService = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User id not provided");
  }

  const studentFields = await Student.findById(userId).select("branch batch valid_till");
  const { branch, batch } = studentFields || {};

  const now = new Date();
  const query = { valid_till: { $gt: now } };

  if (branch) query.for_branch = branch;
  if (batch) query.for_batch = batch;

  const tests = await Test.find(query).select("-problems -__v");
  return tests;
};

// Get Ongoing Test Data Service
export const getOngoingTestDataService = async (testId) => {
  if (!testId) {
    throw new ApiError(400, "testId query parameter is required");
  }

  const testData = await Test.findById(testId)
    .select("-__v -createdAt -updatedAt")
    .populate({
      path: "problems",
      select: "-__v -createdAt -updatedAt -correctOption -subject",
    });

  return testData;
};

// Practice submission service
export const submitSolutionService = async (solutionData, studentId) => {
  if (!solutionData) throw new ApiError(400, "Solution data is required");

  const session = await PracticeSession.create({
    studentId,
    subjectId: solutionData.subjectId || null,
    subjectName: solutionData.subjectName || "Practice",
    category: solutionData.category || "Coding",
    difficulty: solutionData.difficulty || "medium",
    questions: solutionData.questions || [],
    sessionMetadata: {
      startTime: solutionData.startTime || new Date(),
      endTime: new Date(),
      duration: solutionData.duration || 5,
      totalQuestions: solutionData.totalQuestions || 1,
      totalCorrect: solutionData.totalCorrect || 1,
      totalScore: solutionData.totalScore || 10,
      accuracy: solutionData.accuracy || 100
    }
  });

  await computeSingleStudentStats(studentId);
  return session;
};

// Analytics Services
export const getAnalyticsService = async (studentId) => {
  return await getStudentDashboardStats(studentId);
};

export const getStudentStatsService = async (studentId) => {
  return await getStudentDashboardStats(studentId);
};

export const getSubjectPerformanceService = async (studentId) => {
  return await getSubjectPerformance(studentId);
};

export const getPerformanceTrendsService = async (studentId) => {
  return await getPerformanceTrends(studentId);
};

export const getAccuracyMatrixService = async (studentId) => {
  return await getAccuracyMatrix(studentId);
};

export const getLeaderboardService = async (queryOptions) => {
  return await getLeaderboard(queryOptions);
};

export const getPersonalRankingService = async (studentId) => {
  return await getPersonalRanking(studentId);
};

// Student Queries Service
export const submitQueryService = async (queryData, studentId) => {
  if (!queryData || !queryData.queryTitle || !queryData.queryDescription) {
    throw new ApiError(400, "Query title and description are required.");
  }

  const newQuery = await QueryMessage.create({
    studentId,
    queryTitle: queryData.queryTitle,
    queryDescription: queryData.queryDescription,
    queryCategory: queryData.queryCategory || "general",
    priority: queryData.priority || "medium"
  });

  return newQuery;
};

// Resources Service
export const getResourcesService = async (studentId) => {
  const student = await Student.findById(studentId).select("branch batch");
  const filter = {};

  if (student?.branch) {
    filter.$or = [{ branch: { $in: [student.branch] } }, { branch: { $size: 0 } }];
  }

  const resources = await Resource.find(filter).sort({ datePosted: -1 });
  return resources;
};

// Test History Service
export const getTestHistoryService = async (studentId) => {
  const history = await TestAttempt.find({ studentId })
    .populate({ path: "testId", select: "title description category for_branch for_batch" })
    .sort({ attemptDate: -1 });

  return history;
};
