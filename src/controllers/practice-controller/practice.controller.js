import { runCodeApi, runCodeService } from "../../services/student-services/student-practice.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const runCode = asyncHandler(async (req, res) => {
  const { sourceCode, language,userInput } = req.body;
  const res = await runCodeService({ sourceCode, language,userInput});
  res.send(new ApiResponse(200, res.data, "code executes successfully"));
});
