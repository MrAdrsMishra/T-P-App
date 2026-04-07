import { Router } from "express";
import { runCode } from "../../controllers/practice-controller/practice.controller.js";
const practiceSolutionRouter = Router();

practiceSolutionRouter.route("/run-code").post(runCode); //judge0

export default practiceSolutionRouter;  