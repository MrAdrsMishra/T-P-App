import { Router } from "express";
import {
  getMetricTreeController,
  getTagDiagnosticsController,
} from "../../controllers/metric-controller/metric.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const metricRouter = Router();

// GET /api/v1/metrics - Fetch complete metric hierarchy tree
metricRouter.route("/").get(getMetricTreeController);

// GET /api/v1/metrics/:metricId/diagnostics - Fetch weak and strong topics breakdown
metricRouter.route("/:metricId/diagnostics").get(verifyJwt, getTagDiagnosticsController);

export default metricRouter;
