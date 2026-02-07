import { Router } from "express";
import {
  submitTest,
  getOngoingTestInfo,
  getOngoingTestData,
} from "../../controllers/student-controller/student.controller.js";
import verifyJwt from "../../middleware/auth.middleware.js";

const studentRouter = Router();

studentRouter
  .route("/student/get-all-ongoing-tests")
  .get(verifyJwt, getOngoingTestInfo);
studentRouter
  .route("/student/get-test-data")
  .get(verifyJwt, getOngoingTestData);
studentRouter.route("/student/submit-test-data").post(verifyJwt, submitTest);
studentRouter.route("/student/submit-solution").post(verifyJwt, submitSolution);
studentRouter.route("/student/get-analytics").post(verifyJwt, getAnalytics);
studentRouter.route("/student/submit-query").post(verifyJwt, submitQuery);
studentRouter.route("/student/get-resources").post(verifyJwt, getResources);
studentRouter
  .route("/student/get-test-history")
  .post(verifyJwt, getTestHistory);
export default studentRouter;
