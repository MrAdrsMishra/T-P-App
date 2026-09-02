import mongoose from "mongoose";
import dotenv from "dotenv";
import { Metric } from "../models/analytics-models/Metric.models.js";
import { Student } from "../models/user-models/student.models.js";
import { Question } from "../models/test-models/questions.models.js";
import { Test } from "../models/test-models/test.models.js";
import { StudentMetricPerformance } from "../models/analytics-models/StudentMetricPerformance.models.js";
import { RankingSnapshot } from "../models/analytics-models/RankingSnapshot.models.js";
import { submitTestService } from "../services/student-services/student.service.js";
import { calculateRankingSnapshots, getRankings } from "../services/analytics-services/rankingEngine.service.js";

dotenv.config();

async function runSmokeTest() {
  try {
    console.log("=== [Smoke Test] Connecting to MongoDB ===");
    const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/placement-engine";
    await mongoose.connect(mongoUri);
    console.log("Connected successfully to:", mongoUri);

    // 1. Create dynamic Metric hierarchy: English -> Grammar -> Prepositions
    console.log("\n1. Creating Dynamic Metric Hierarchy...");
    let englishDomain = await Metric.findOne({ slug: "english" });
    if (!englishDomain) {
      englishDomain = await Metric.create({
        name: "English",
        slug: "english",
        type: "DOMAIN",
        parentId: null,
        ancestors: [],
      });
    }

    let grammarCategory = await Metric.findOne({ slug: "grammar" });
    if (!grammarCategory) {
      grammarCategory = await Metric.create({
        name: "Grammar",
        slug: "grammar",
        type: "CATEGORY",
        parentId: englishDomain._id,
        ancestors: [englishDomain._id],
      });
    }

    let prepTopic = await Metric.findOne({ slug: "prepositions" });
    if (!prepTopic) {
      prepTopic = await Metric.create({
        name: "Prepositions",
        slug: "prepositions",
        type: "TOPIC",
        parentId: grammarCategory._id,
        ancestors: [grammarCategory._id, englishDomain._id],
      });
    }
    console.log("Metric Tree Nodes Created:", {
      domain: englishDomain.slug,
      category: grammarCategory.slug,
      topic: prepTopic.slug,
    });

    // 2. Create Test Student
    console.log("\n2. Creating Test Student...");
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const testEnrollment = `2026CS${randomDigits}`;
    const student = await Student.create({
      fullName: "Test Student Alpha",
      email: `teststudent_${Date.now()}@example.com`,
      password: "password123",
      enrollment: testEnrollment,
      course: "B.Tech",
      stream: "CSE",
      branch: "CSE",
      batch: "2023-2027",
    });
    console.log("Student Created:", { id: student._id, name: student.fullName, branch: student.branch, batch: student.batch });

    // 3. Create Question bound to Prepositions metric
    console.log("\n3. Creating Question bound to Prepositions...");
    const question = await Question.create({
      problemStatement: "Choose the correct preposition: She sat ___ the chair.",
      questionType: "mcq",
      difficulty: "easy",
      allocatedMark: 10,
      negativeMarks: 0,
      tags: ["prepositions-of-place", "grammar-basics"],
      metrics: [{ metricId: prepTopic._id, weight: 1.0 }],
      metricAncestors: [prepTopic._id, grammarCategory._id, englishDomain._id],
      options: [
        { optionText: "on", isCorrect: true, explanation: "On is used for surfaces" },
        { optionText: "at", isCorrect: false },
        { optionText: "in", isCorrect: false },
      ],
    });
    console.log("Question Created:", { id: question._id, tags: question.tags, metric: prepTopic.name });

    // 4. Create Test
    console.log("\n4. Creating Test containing Question...");
    const test = await Test.create({
      title: "English Grammar Diagnostic Test",
      description: "Diagnostic test for prepositions and grammar",
      category: "MCQ",
      duration: 30,
      numberOfQuestions: 1,
      total_marks: 10,
      problems: [question._id],
      for_branch: "CSE",
      for_batch: "2023-2027",
      createdBy: student._id,
      validTill: new Date(Date.now() + 86400000), // 1 day in future
    });
    console.log("Test Created:", { id: test._id, title: test.title });

    // 5. Submit Test Attempt
    console.log("\n5. Submitting Test Attempt...");
    const answers = {
      [question._id.toString()]: "on", // Correct answer
    };

    const submissionResult = await submitTestService(test._id.toString(), answers, student._id.toString(), 45);
    console.log("Test Submission Result:", submissionResult);

    // 6. Verify Upward Metric Rollup in StudentMetricPerformance
    console.log("\n6. Verifying Upward Metric Performance Rollup...");
    const perfRecords = await StudentMetricPerformance.find({ studentId: student._id }).populate("metricId").lean();
    
    console.log(`Found ${perfRecords.length} StudentMetricPerformance records for student.`);
    for (const perf of perfRecords) {
      console.log(` -> Metric: ${perf.metricId?.name} (${perf.metricId?.type}) | Accuracy: ${perf.accuracy}% | Marks: ${perf.obtainedMarks}/${perf.totalMarks} | Period: ${perf.period.type}:${perf.period.key}`);
      if (perf.tagBreakdown && perf.tagBreakdown.length > 0) {
        console.log(`    Tag Breakdown:`, perf.tagBreakdown);
      }
    }

    // 7. Calculate Ranking Snapshots
    console.log("\n7. Calculating Ranking Snapshots across Scopes...");
    await calculateRankingSnapshots({
      metricId: prepTopic._id,
      scopeType: "GLOBAL",
      scopeId: "ALL",
      period: { type: "ALL_TIME", key: "ALL" },
      tieStrategy: "dense",
    });

    await calculateRankingSnapshots({
      metricId: prepTopic._id,
      scopeType: "BRANCH",
      scopeId: "CSE",
      period: { type: "ALL_TIME", key: "ALL" },
      tieStrategy: "dense",
    });

    // 8. Query Rankings via getRankings
    console.log("\n8. Querying Rankings via getRankings service...");
    const globalRankings = await getRankings({
      metricId: prepTopic._id,
      scopeType: "GLOBAL",
      scopeId: "ALL",
      page: 1,
      limit: 10,
    });
    console.log("Global Rankings Query Result:", {
      total: globalRankings.total,
      topEntry: globalRankings.rankings[0] ? {
        rank: globalRankings.rankings[0].rank,
        student: globalRankings.rankings[0].studentId?.fullName,
        score: globalRankings.rankings[0].score,
      } : null,
    });

    console.log("\n=== [Smoke Test PASSED SUCCESSFULLY] ===");
  } catch (error) {
    console.error("\n=== [Smoke Test FAILED] ===", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runSmokeTest();
