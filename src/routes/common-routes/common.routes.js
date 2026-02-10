import { Router } from "express";
import {
  loginUser,
  logoutUser,
  updateUser,
  getProblems,
  getOngoingTestInfo,
  getOngoingTestData
} from "../../controllers/common-controller/common.controller.js";
import { uploadImg } from "../../middleware/multer.middleware.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const commonRouter = Router();

commonRouter.route("/login").post(loginUser);
commonRouter.route("/logout").post(verifyJwt, logoutUser);
commonRouter
  .route("/update-user-profile")
  .post(verifyJwt, uploadImg.single("profilePic"), updateUser);
commonRouter.route("/get-problems").get(verifyJwt, getProblems);
commonRouter
  .route("/get-ongoing-tests-info")
  .get(verifyJwt, getOngoingTestInfo);
commonRouter.route("/get-ongoing-test-data").get(verifyJwt, getOngoingTestData);
export default commonRouter;
