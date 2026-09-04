import { Router } from "express";
import {
  getRankingsController,
  getStudentSummaryController,
  getHierarchicalPerformanceController,
  getSkillsClassificationController,
  getPerformanceTrendsController,
  getCodingAnalyticsController,
  getPlacementReadinessController,
  getPeerComparisonController,
  getAdminOverviewController,
  getAcademicPerformanceController,
  getTopicHeatmapController,
  getQuestionAnalyticsController,
  getAssessmentAnalyticsAdminController,
  getAtRiskStudentsController,
  getImprovementAnalyticsController,
  getParticipationAnalyticsController,
} from "../../controllers/analytics-controller/analytics.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const analyticsRouter = Router();

// General Ranking Explorer
analyticsRouter.route("/rankings").get(getRankingsController);

// Student Analytics Routes
analyticsRouter.route("/student/summary").get(getStudentSummaryController);
analyticsRouter.route("/student/summary/:studentId").get(getStudentSummaryController);

analyticsRouter.route("/student/performance-tree").get(getHierarchicalPerformanceController);
analyticsRouter.route("/student/performance-tree/:studentId").get(getHierarchicalPerformanceController);
analyticsRouter.route("/student-tree-performance").get(getHierarchicalPerformanceController);

analyticsRouter.route("/student/skills").get(getSkillsClassificationController);
analyticsRouter.route("/student/skills/:studentId").get(getSkillsClassificationController);

analyticsRouter.route("/student/trends").get(getPerformanceTrendsController);
analyticsRouter.route("/student/trends/:studentId").get(getPerformanceTrendsController);

analyticsRouter.route("/student/coding").get(getCodingAnalyticsController);
analyticsRouter.route("/student/coding/:studentId").get(getCodingAnalyticsController);

analyticsRouter.route("/student/placement-readiness").get(getPlacementReadinessController);
analyticsRouter.route("/student/placement-readiness/:studentId").get(getPlacementReadinessController);

analyticsRouter.route("/student/comparison").get(getPeerComparisonController);
analyticsRouter.route("/student/comparison/:studentId").get(getPeerComparisonController);

// Admin Analytics Routes
analyticsRouter.route("/admin/overview").get(getAdminOverviewController);
analyticsRouter.route("/admin/performance").get(getAcademicPerformanceController);
analyticsRouter.route("/admin/topics").get(getTopicHeatmapController);
analyticsRouter.route("/admin/questions").get(getQuestionAnalyticsController);
analyticsRouter.route("/admin/assessments").get(getAssessmentAnalyticsAdminController);
analyticsRouter.route("/admin/students/at-risk").get(getAtRiskStudentsController);
analyticsRouter.route("/admin/improvement").get(getImprovementAnalyticsController);
analyticsRouter.route("/admin/participation").get(getParticipationAnalyticsController);

export default analyticsRouter;
