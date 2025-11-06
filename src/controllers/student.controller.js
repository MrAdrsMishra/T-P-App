import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.models.js";
import { Student } from "../models/student.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Test } from "../models/test.models.js";

const submitTest = asyncHandler(async (req, res) => {
  const { testId, answers } = req.body;
  const studentId = req.user._id;
    console.log("Received test submission:", { testId, answers, studentId });
    if (!testId || !answers) {
        throw new ApiError(400, "Test ID and answers are required.");
    }

    // Fetch the test details
    const test = await Test.findById(testId).select('problems').populate('problems');
    console.log("Fetched test details:", test);
    if (!test) {
        throw new ApiError(404, "Test not found.");
    }
    // pick test prooblem arr and check one by one for each obj elemnt if the correct option of this pid matches the ansewer under pid in ans obj
    let Answer=0;
    for (let problem of test.problems) {
        const studentAnswer = answers[problem._id];
        if(studentAnswer === undefined) continue; // skip if no answer provided
        else if (studentAnswer === problem.correctOption) {
            Answer += problem.allocatedMark;
        }
    }
    console.log("Calculated score:", Answer);
    return res.status(200).json(new ApiResponse(200,Answer, "Test submitted successfully."));
});
export { submitTest }