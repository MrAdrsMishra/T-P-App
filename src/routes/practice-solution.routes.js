import { Router } from "express";
import { runCode } from "../controllers/student-services/student-practice.controller.js";

const practiceSolutionRouter = Router();

practiceSolutionRouter.route("/run-code").post(runCode);

export default practiceSolutionRouter;  