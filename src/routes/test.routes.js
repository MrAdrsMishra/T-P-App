import { Router } from "express";
import { createProblemSet, createTest } from "../controllers/admin.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { getOngoingTestInfo,getOngoingTestData } from "../controllers/common.controller.js";
import { submitTest } from "../controllers/student.controller.js";
const testRouter = Router();

testRouter.route("/admin/create-test").post(verifyJwt,createTest);// done
testRouter.route("/admin/create-problem-set").post(verifyJwt,createProblemSet);// done
testRouter.route("/student/get-all-ongoing-tests").get(verifyJwt,getOngoingTestInfo);// done
testRouter.route("/student/get-test-data").get(verifyJwt,getOngoingTestData);// done
testRouter.route("/student/submit-test-data").post(verifyJwt,submitTest);// done

export default testRouter;  