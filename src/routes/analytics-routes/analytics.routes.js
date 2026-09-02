import { Router } from "express";
import {
  getRankingsController,
  getStudentTreePerformanceController,
} from "../../controllers/analytics-controller/analytics.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const analyticsRouter = Router();

// GET /api/v1/analytics/rankings - Leaderboard rankings snapshots query
analyticsRouter.route("/rankings").get(getRankingsController);

// GET /api/v1/analytics/student-tree-performance - Student metric tree performance
analyticsRouter.route("/student-tree-performance").get(verifyJwt, getStudentTreePerformanceController);

export default analyticsRouter;
