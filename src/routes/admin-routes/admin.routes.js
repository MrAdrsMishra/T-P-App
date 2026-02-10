import { Router } from "express";
import { verifyJwt, checkAdminRole } from "../../middleware/auth.middleware.js";
import { createAssignment, createProblemSet, createResource, createTest, deleteStudent, getAnalytics, getProblemSet, getQuery, getStudentAnalytics, getStudentProjectsDetail, registerAdmin, registerStudent, responseQuery } from "../../controllers/admin-controller/admin.controller.js";

const adminRouter = Router();

adminRouter.route("/register-admin").post(registerAdmin);
adminRouter
  .route("/register-student")
  .post(verifyJwt, checkAdminRole, registerStudent);
adminRouter
  .route("/delete-student")
  .post(verifyJwt, checkAdminRole, deleteStudent);
adminRouter
  .route(" /create-test")
  .post(verifyJwt, checkAdminRole, createTest);
adminRouter
  .route(" /create-problem-set")
  .post(verifyJwt, checkAdminRole, createProblemSet);
adminRouter.route(" /get-problem-set").get(verifyJwt, checkAdminRole, getProblemSet);
adminRouter
  .route(" /create-resources") // {title,description,url,type,category,tags}
  .post(verifyJwt, checkAdminRole, createResource);
adminRouter
  .route(" /create-assignments")
  .post(verifyJwt, checkAdminRole, createAssignment);
adminRouter.route(" /get-query").get(verifyJwt, checkAdminRole, getQuery);
adminRouter
  .route(" /response-query")
  .post(verifyJwt, checkAdminRole, responseQuery);
adminRouter
  .route(" /get-student-details")
  .get(verifyJwt, checkAdminRole, getStudentAnalytics);
adminRouter
  .route(" /get-student-projects-details")
  .get(verifyJwt, checkAdminRole, getStudentProjectsDetail);
adminRouter
  .route(" /get-analytics")
  .get(verifyJwt, checkAdminRole, getAnalytics);

export default adminRouter;
