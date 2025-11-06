import { Router } from "express";
import {  checkAdminRole, createProblemSet, deleteStudent,getProblemSet,registerAdmin, registerStudent } from "../controllers/admin.controller.js";
import {  loginUser, logoutUser, updateUser } from "../controllers/common.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { uploadImg } from "../middleware/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register-admin").post(registerAdmin)// done
userRouter.route("/login").post(loginUser)// done
userRouter.route("/logout").post(verifyJwt,logoutUser)// done
userRouter.route("/update-user-profile").post(verifyJwt,uploadImg.single('profilePic'),updateUser)// done

userRouter.route("/register-student").post(verifyJwt,checkAdminRole,registerStudent)// done
userRouter.route("/delete-student").post(verifyJwt,checkAdminRole,deleteStudent)//done

userRouter.route("/create-problem-set").post(verifyJwt,checkAdminRole,createProblemSet)// done
userRouter.route("/get-problem-set").get(verifyJwt,checkAdminRole,getProblemSet) // done
export default userRouter;
