import { runCodeService } from "../../services/student-services/student-practice.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const runCode = asyncHandler(async (req, res) => {
  const { sourceCode, language, userInput } = req.body;
  const result = await runCodeService({ sourceCode, language, userInput });
  res.send(new ApiResponse(200, result.data, "code executes successfully"));
});
