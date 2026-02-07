import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware.js";
import {
  checkAdminRole,
  createProblemSet,
  createTest,
  deleteStudent,
  registerAdmin,
  registerStudent,
} from "../../controllers/admin-controller/admin.controller.js";

const adminRouter = Router();

adminRouter.route("/register-admin").post(registerAdmin);
adminRouter
  .route("/register-student")
  .post(verifyJwt, checkAdminRole, registerStudent);
adminRouter
  .route("/delete-student")
  .post(verifyJwt, checkAdminRole, deleteStudent);
adminRouter
  .route("/admin/create-test")
  .post(verifyJwt, checkAdminRole, createTest);
adminRouter
  .route("/admin/create-problem-set")
  .post(verifyJwt, checkAdminRole, createProblemSet);
adminRouter
  .route("/admin/create-resources")
  .post(verifyJwt, checkAdminRole, createResource);
adminRouter
  .route("/admin/create-assignments")
  .post(verifyJwt, checkAdminRole, createAssignment);
adminRouter.route("/admin/get-query").get(verifyJwt, checkAdminRole, getQuery);
adminRouter
  .route("/admin/response-query")
  .post(verifyJwt, checkAdminRole, responseQuery);
adminRouter
  .route("/admin/get-student-details")
  .get(verifyJwt, checkAdminRole, getStudentDetails);
adminRouter
  .route("/admin/get-student-projects-details")
  .get(verifyJwt, checkAdminRole, getStudentProjectsDetail);
adminRouter
  .route("/admin/get-analytics")
  .get(verifyJwt, checkAdminRole, getAnalytics);

export default adminRouter;
