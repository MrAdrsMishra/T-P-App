import { Student } from "../../models/student.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { Test } from "../../models/test.models.js";

// Submit Test Service
export const submitTestService = async (testId, answers, studentId) => {
  console.log("Received test submission:", { testId, answers, studentId });

  if (!testId || !answers) {
    throw new ApiError(400, "Test ID and answers are required.");
  }

  // Fetch the test details
  const test = await Test.findById(testId)
    .select("problems")
    .populate("problems");

  console.log("Fetched test details:", test);

  if (!test) {
    throw new ApiError(404, "Test not found.");
  }

  // Calculate score by comparing student answers with correct options
  let score = 0;
  for (let problem of test.problems) {
    const studentAnswer = answers[problem._id];
    if (studentAnswer === undefined)
      continue; // skip if no answer provided
    else if (studentAnswer === problem.correctOption) {
      score += problem.allocatedMark;
    }
  }

  console.log("Calculated score:", score);

  return score;
};
// Get Ongoing Test Info Service
export const getOngoingTestInfoService = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User id not provided");
  }

  // Fetch student fields
  const studentFields = await Student.findById(userId).select(
    "for_branch for_batch valid_till"
  );
  const { for_branch, for_batch, valid_till } = studentFields || {};

  const now = new Date();
  const query = { valid_till: { $gt: now } };

  // Optionally filter tests by student's branch/batch if present
  if (for_branch) query.for_branch = for_branch;
  if (for_batch) query.for_batch = for_batch;

  const tests = await Test.find(query).select("-problems -__v");

  return tests;
};

// Get Ongoing Test Data Service
export const getOngoingTestDataService = async (testId) => {
  if (!testId) {
    throw new ApiError(400, "testId query parameter is required");
  }

  const testData = await Test.findById(testId)
    .select("-__v -createdAt -updatedAt")
    .populate({
      path: "problems",
      select: "-__v -createdAt -updatedAt -correctOption -subject",
    });

  console.log("Test data fetch completed", testData);

  return testData;
};
export const submitSolutionService = async () => {};
export const getAnalyticsService = async () => {};
export const submitQueryService = async () => {};
export const getResourcesService = async () => {};
export const getTestHistoryService = async () => {};
