import { Router } from "express";
import {
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
} from "../../controllers/student-controller/student.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const studentRouter = Router();

// Test & Practice Submission Routes
studentRouter.route("/submit-test-data").post(verifyJwt, submitTest);
studentRouter.route("/submit-solution").post(verifyJwt, submitSolution);

// Dashboard Analytics Routes
studentRouter.route("/get-analytics").get(verifyJwt, getAnalytics).post(verifyJwt, getAnalytics);

// Granular Pre-Calculated Analytics Routes
studentRouter.route("/stats").get(verifyJwt, getStudentStats);
studentRouter.route("/performance/subject").get(verifyJwt, getSubjectPerformance);
studentRouter.route("/performance/trends").get(verifyJwt, getPerformanceTrends);
studentRouter.route("/performance/accuracy").get(verifyJwt, getAccuracyMatrix);

// Leaderboard & Personal Multi-Tier Ranking Routes
studentRouter.route("/leaderboard").get(verifyJwt, getLeaderboard);
studentRouter.route("/ranking").get(verifyJwt, getPersonalRanking);

// General Student Interaction Routes
studentRouter.route("/submit-query").post(verifyJwt, submitQuery);
studentRouter.route("/get-resources").get(verifyJwt, getResources).post(verifyJwt, getResources);
studentRouter.route("/get-test-history").get(verifyJwt, getTestHistory).post(verifyJwt, getTestHistory);

export default studentRouter;
