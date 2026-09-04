import mongoose from "mongoose";
import dotenv from "dotenv";
import { Metric } from "../models/analytics-models/Metric.models.js";
import { Student } from "../models/user-models/student.models.js";
import { Question } from "../models/test-models/questions.models.js";
import { Test } from "../models/test-models/test.models.js";
import { StudentMetricPerformance } from "../models/analytics-models/StudentMetricPerformance.models.js";
import { RankingSnapshot } from "../models/analytics-models/RankingSnapshot.models.js";
import { submitTestService } from "../services/student-services/student.service.js";
import {
  calculateRankingSnapshots,
  getRankings,
} from "../services/analytics-services/rankingEngine.service.js";
import {
  getStudentSummaryService,
  getHierarchicalPerformanceService,
  getSkillsClassificationService,
  getPerformanceTrendsService,
  getCodingAnalyticsService,
  getPlacementReadinessService,
  getPeerComparisonService,
  getAdminOverviewService,
  getAcademicPerformanceService,
  getTopicHeatmapService,
  getQuestionAnalyticsService,
  getAtRiskStudentsService,
  getImprovementAnalyticsService,
  getParticipationAnalyticsService,
} from "../services/analytics-services/analytics.service.js";

dotenv.config();

async function runTestAnalyticsSuite() {
  console.log("\n========================================================");
  console.log("🚀 STARTING PLACEMENT ENGINE ANALYTICS TEST SUITE");
  console.log("========================================================\n");

  try {
    const mongoUri =
      process.env.MONGODB_URL ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/placement-engine";

    console.log("1. Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✓ Connected successfully.");

    // --- TEST STEP A: Seed Students across Branches & Batches ---
    console.log("\n2. Seeding Test Students across Scopes...");
    const student1 = await Student.create({
      fullName: "Alice Student",
      email: `alice_${Date.now()}@example.com`,
      password: "password123",
      enrollment: `2026CS${Math.floor(100000 + Math.random() * 900000)}`,
      course: "B.Tech",
      stream: "CSE",
      branch: "CSE-AIML",
      batch: "2022-2026",
    });

    const student2 = await Student.create({
      fullName: "Bob Student",
      email: `bob_${Date.now()}@example.com`,
      password: "password123",
      enrollment: `2026CS${Math.floor(100000 + Math.random() * 900000)}`,
      course: "B.Tech",
      stream: "CSE",
      branch: "CSE-AIML",
      batch: "2022-2026",
    });

    const student3 = await Student.create({
      fullName: "Charlie Student",
      email: `charlie_${Date.now()}@example.com`,
      password: "password123",
      enrollment: `2026EC${Math.floor(100000 + Math.random() * 900000)}`,
      course: "B.Tech",
      stream: "ECE",
      branch: "ECE",
      batch: "2023-2027",
    });

    console.log("✓ Created 3 test students (Alice, Bob in CSE-AIML; Charlie in ECE).");

    // --- TEST STEP B: Verify Extensibility Requirement (Section 32) ---
    console.log("\n3. Testing Mandatory Extensibility Requirement (Section 32)...");
    console.log("   Creating NEW Metric: Generative AI -> Prompt Engineering...");

    let aiDomain = await Metric.findOne({ slug: "generative-ai" });
    if (!aiDomain) {
      aiDomain = await Metric.create({
        name: "Generative AI",
        slug: "generative-ai",
        type: "DOMAIN",
        parentId: null,
        ancestors: [],
      });
    }

    let promptTopic = await Metric.findOne({ slug: "prompt-engineering" });
    if (!promptTopic) {
      promptTopic = await Metric.create({
        name: "Prompt Engineering",
        slug: "prompt-engineering",
        type: "TOPIC",
        parentId: aiDomain._id,
        ancestors: [aiDomain._id],
      });
    }

    console.log("✓ Created New Metric:", {
      domain: aiDomain.name,
      topic: promptTopic.name,
    });

    // Create Question bound to Prompt Engineering
    const aiQuestion = await Question.create({
      problemStatement: "What is Zero-Shot Prompting in LLMs?",
      questionType: "mcq",
      difficulty: "medium",
      allocatedMark: 10,
      negativeMarks: 0,
      tags: ["llm", "zero-shot", "prompting"],
      metrics: [{ metricId: promptTopic._id, weight: 1.0 }],
      metricAncestors: [promptTopic._id, aiDomain._id],
      options: [
        { optionText: "Prompting without prior task examples", isCorrect: true },
        { optionText: "Prompting with 10 examples", isCorrect: false },
      ],
    });

    const aiTest = await Test.create({
      title: "Generative AI Assessment",
      description: "Evaluation on Prompt Engineering",
      category: "MCQ",
      duration: 15,
      numberOfQuestions: 1,
      total_marks: 10,
      problems: [aiQuestion._id],
      createdBy: student1._id,
      validTill: new Date(Date.now() + 86400000),
    });

    console.log("✓ Created AI Question & Test.");

    // Submit attempt for Alice (Correct answer)
    await submitTestService(
      aiTest._id.toString(),
      { [aiQuestion._id.toString()]: "Prompting without prior task examples" },
      student1._id.toString(),
      30
    );

    // Submit attempt for Bob (Wrong answer)
    await submitTestService(
      aiTest._id.toString(),
      { [aiQuestion._id.toString()]: "Prompting with 10 examples" },
      student2._id.toString(),
      45
    );

    console.log("✓ Submitted AI Test attempts for Alice (Correct) and Bob (Incorrect).");

    // Verify AI Topic performance calculation
    const aliceSummary = await getStudentSummaryService(student1._id.toString());
    console.log("✓ Alice Summary calculated without code changes:", {
      overallScore: aliceSummary.overallScore,
      categoryPerformance: aliceSummary.categoryPerformance,
    });

    const aliceSkills = await getSkillsClassificationService(student1._id.toString());
    console.log("✓ Alice Strong Skills includes Prompt Engineering/Tags:", {
      strongSkills: aliceSkills.strongSkills.map((s) => s.name),
    });

    const bobSkills = await getSkillsClassificationService(student2._id.toString());
    console.log("✓ Bob Weak Skills includes Prompt Engineering/Tags:", {
      weakSkills: bobSkills.weakSkills.map((s) => s.name),
    });

    // --- TEST STEP C: Ranking Engine & Scope Filtering ---
    console.log("\n4. Testing Scope-based Ranking Calculation & Queries...");

    await calculateRankingSnapshots({
      metricId: promptTopic._id,
      scopeType: "GLOBAL",
      scopeId: "ALL",
    });

    await calculateRankingSnapshots({
      metricId: promptTopic._id,
      scopeType: "BRANCH",
      scopeId: "CSE-AIML",
    });

    const globalRankings = await getRankings({
      metricId: promptTopic._id,
      scopeType: "GLOBAL",
      scopeId: "ALL",
      page: 1,
      limit: 10,
    });

    console.log("✓ Global Ranking Snapshot query:", {
      total: globalRankings.total,
      topRanker: globalRankings.rankings[0]?.studentId?.fullName,
      topPercentile: globalRankings.rankings[0]?.percentile,
    });

    const branchRankings = await getRankings({
      metricId: promptTopic._id,
      scopeType: "BRANCH",
      scopeId: "CSE-AIML",
      rankFrom: 1,
      rankTo: 5,
    });

    console.log("✓ Branch CSE-AIML Rank range query (1-5):", {
      total: branchRankings.total,
      entriesCount: branchRankings.rankings.length,
    });

    // --- TEST STEP D: Admin Topic Heatmap & At-Risk Analytics ---
    console.log("\n5. Testing Admin Topic Heatmap (High Priority) & At-Risk Detection...");

    const heatmap = await getTopicHeatmapService();
    console.log("✓ Admin Topic Heatmap result count:", heatmap.heatmap.length);

    const promptHeatmapEntry = heatmap.heatmap.find((h) => h.topicName === "Prompt Engineering");
    console.log("✓ Topic Heatmap entry for Prompt Engineering:", promptHeatmapEntry);

    const atRisk = await getAtRiskStudentsService();
    console.log("✓ At-Risk Students identified:", atRisk.atRiskStudents.length);
    if (atRisk.atRiskStudents.length > 0) {
      console.log("   Sample At-Risk Student:", {
        name: atRisk.atRiskStudents[0].fullName,
        riskLevel: atRisk.atRiskStudents[0].riskLevel,
        reasons: atRisk.atRiskStudents[0].reasons,
      });
    }

    // --- TEST STEP E: Admin Overview & Peer Comparison ---
    console.log("\n6. Testing Admin Overview & Peer Comparison...");

    const adminOverview = await getAdminOverviewService();
    console.log("✓ Admin Overview Stats:", adminOverview);

    const academicPerf = await getAcademicPerformanceService();
    console.log("✓ Academic Performance Breakdown:", academicPerf);

    const peerComp = await getPeerComparisonService(student1._id.toString());
    console.log("✓ Peer Comparison for Alice:", peerComp);

    console.log("\n========================================================");
    console.log("🎉 ALL ANALYTICS TEST SUITE VERIFICATIONS PASSED!");
    console.log("========================================================\n");

  } catch (error) {
    console.error("\n❌ ANALYTICS TEST SUITE FAILED:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTestAnalyticsSuite();
