
import { Test } from "../../models/test-models/test.models.js";
import { Question } from "../../models/test-models/questions.models.js";
import { TestAttempt } from "../../models/test-models/testAttempts.models.js";
import { ApiError } from "../../utils/ApiError.js";

// Get All Tests
export const getAllTestsService = async (status) => {
    const query = {};
    if (status) {
        query.status = status;
    }
    return await Test.find(query).select("-questions"); // Don't send questions list in summary
};

// Get Test By ID (Start Test)
export const getTestByIdService = async (testId) => {
    const test = await Test.findById(testId).populate({
        path: "questions",
        select: "-correctOption", // Hide correct option
    });

    if (!test) {
        throw new ApiError(404, "Test not found");
    }

    return test;
};

// Submit Test
export const submitTestService = async (userId, testId, answers) => {
    const test = await Test.findById(testId).populate("questions");
    if (!test) {
        throw new ApiError(404, "Test not found");
    }

    let score = 0;
    const totalQuestions = test.questions.length;
    const attemptedQuestions = answers.length;

    // Calculate Score
    // answers: [{ questionId, selectedOption }]

    // Create a map for quick lookup
    const questionMap = new Map(test.questions.map(q => [q._id.toString(), q]));

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;
    const subjectScoresMap = {};

    for (const ans of answers) {
        const question = questionMap.get(ans.questionId);
        if (question) {
            const isCorrect = question.correctOption === ans.selectedOption;

            // Initialize subject score if not exists
            const subjectId = question.subject.toString();
            if (!subjectScoresMap[subjectId]) {
                subjectScoresMap[subjectId] = { score: 0, maxMarks: 0 };
            }
            subjectScoresMap[subjectId].maxMarks += question.allocatedMark;

            if (isCorrect) {
                score += question.allocatedMark;
                correctAnswers++;
                subjectScoresMap[subjectId].score += question.allocatedMark;
            } else {
                wrongAnswers++;
            }
        }
    }

    skippedAnswers = totalQuestions - (correctAnswers + wrongAnswers);

    const subjectScores = Object.keys(subjectScoresMap).map(subjectId => ({
        subjectId,
        scoreObtained: subjectScoresMap[subjectId].score,
        maxMarks: subjectScoresMap[subjectId].maxMarks
    }));

    // Create Attempt Record
    const attempt = await TestAttempt.create({
        studentId: userId,
        testId,
        testScore: score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        skippedAnswers,
        status: "submitted",
        subjectScores,
        attemptCount: 1
    });

    return attempt;
};
