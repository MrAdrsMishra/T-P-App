import { Router } from "express";
import {
  getResources,
  getTestHistory,
  submitQuery,
  submitSolution,
  submitTest,
} from "../../controllers/student-controller/student.controller.js";
 import {verifyJwt}  from "../../middleware/auth.middleware.js";
import { getAnalytics } from "../../controllers/admin-controller/admin.controller.js";
const studentRouter = Router();

studentRouter.route("/submit-test-data").post(verifyJwt, submitTest);
studentRouter.route("/submit-solution").post(verifyJwt, submitSolution);
studentRouter.route("/get-analytics").post(verifyJwt, getAnalytics);
studentRouter.route("/submit-query").post(verifyJwt, submitQuery);
studentRouter.route("/get-resources").post(verifyJwt, getResources);
studentRouter
  .route("/get-test-history")
  .post(verifyJwt, getTestHistory);
export default studentRouter;
