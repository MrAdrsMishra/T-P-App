import { Router } from "express";
import {
  loginUser,
  logoutUser,
  updateUser,
} from "../../controllers/common-controller/common.controller.js";
import {
  getProblemSet,
  checkAdminRole,
} from "../../controllers/admin-controller/admin.controller.js";
import verifyJwt from "../../middleware/auth.middleware.js";
import { uploadImg } from "../../middleware/multer.middleware.js";

const commonRouter = Router();

commonRouter.route("/login").post(loginUser);
commonRouter.route("/logout").post(verifyJwt, logoutUser);
commonRouter
  .route("/update-user-profile")
  .post(verifyJwt, uploadImg.single("profilePic"), updateUser);
commonRouter
  .route("/get-problem-set")
  .get(verifyJwt, checkAdminRole, getProblemSet);
commonRouter
  .route("/get-all-ongoing-tests")
  .get(verifyJwt, getOngoingTestInfo);
commonRouter
  .route("/get-test-data")
  .get(verifyJwt, getOngoingTestData);
export default commonRouter;
