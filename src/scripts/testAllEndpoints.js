import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import { app } from "../app.js";
import { Student } from "../models/user-models/student.models.js";
import { Metric } from "../models/analytics-models/Metric.models.js";
import { Question } from "../models/test-models/questions.models.js";
import { Test } from "../models/test-models/test.models.js";

dotenv.config();

async function testEndpoints() {
  let server;
  try {
    const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017/placement-engine";
    await mongoose.connect(mongoUri);
    console.log("✅ Database Connected.");

    // Start ephemeral server for testing exact current codebase
    server = app.listen(0);
    const port = server.address().port;
    const BASE_URL = `http://localhost:${port}`;

    console.log(`\n==================================================`);
    console.log(`🚀 STARTING ENDPOINT TESTING AGAINST: ${BASE_URL}`);
    console.log(`==================================================\n`);

    // Setup Test Student
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const testEnrollment = `2026CS${randomDigits}`;
    let student = await Student.create({
      fullName: "Endpoint Tester Student",
      email: `tester_${Date.now()}@example.com`,
      password: "password123",
      enrollment: testEnrollment,
      course: "B.Tech",
      stream: "CSE",
      branch: "CSE",
      batch: "2023-2027",
      role: "Student",
    });

    const token = student.generateAccessToken();
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log("✅ Created Student & Generated JWT Auth Token.");

    // Setup Metric
    let metric = await Metric.findOne({ isActive: true });
    if (!metric) {
      metric = await Metric.create({
        name: "Endpoint Test Metric",
        slug: `test-metric-${Date.now()}`,
        type: "DOMAIN",
      });
    }
    const testMetricId = metric._id.toString();
    console.log("✅ Metric Node Identified:", metric.name);

    // Setup Question & Test
    const question = await Question.create({
      problemStatement: "What is the primary color of the sky?",
      questionType: "mcq",
      difficulty: "easy",
      allocatedMark: 10,
      metrics: [{ metricId: metric._id, weight: 1.0 }],
      metricAncestors: [metric._id],
      tags: ["general-knowledge"],
      options: [
        { optionText: "Blue", isCorrect: true },
        { optionText: "Green", isCorrect: false },
      ],
    });

    const test = await Test.create({
      title: "Automated API Route Test",
      description: "Validation suite forPlacement Engine endpoints",
      category: "MCQ",
      duration: 20,
      numberOfQuestions: 1,
      total_marks: 10,
      problems: [question._id],
      for_branch: "CSE",
      for_batch: "2023-2027",
      createdBy: student._id,
      validTill: new Date(Date.now() + 86400000),
    });

    const testId = test._id.toString();
    const questionId = question._id.toString();

    const results = [];

    async function testRoute(name, requestFn) {
      try {
        const res = await requestFn();
        results.push({
          endpoint: name,
          status: res.status,
          success: res.data?.success ?? true,
          message: res.data?.message || "OK",
        });
        console.log(`✅ [${res.status}] ${name}`);
      } catch (err) {
        const status = err.response?.status || "ERROR";
        const message = err.response?.data?.message || err.message;
        results.push({
          endpoint: name,
          status,
          success: false,
          message,
        });
        console.log(`❌ [${status}] ${name} - ${message}`);
      }
    }

    // 1. GET /api/v1/metrics
    await testRoute("GET /api/v1/metrics", () =>
      axios.get(`${BASE_URL}/api/v1/metrics`)
    );

    // 2. GET /api/v1/metrics/:metricId/diagnostics
    await testRoute(`GET /api/v1/metrics/${testMetricId}/diagnostics`, () =>
      axios.get(`${BASE_URL}/api/v1/metrics/${testMetricId}/diagnostics`, authHeaders)
    );

    // 3. GET /api/v1/analytics/rankings
    await testRoute(`GET /api/v1/analytics/rankings?metricId=${testMetricId}&scopeType=GLOBAL&scopeId=ALL`, () =>
      axios.get(`${BASE_URL}/api/v1/analytics/rankings?metricId=${testMetricId}&scopeType=GLOBAL&scopeId=ALL`)
    );

    // 4. GET /api/v1/analytics/student-tree-performance
    await testRoute("GET /api/v1/analytics/student-tree-performance", () =>
      axios.get(`${BASE_URL}/api/v1/analytics/student-tree-performance`, authHeaders)
    );

    // 5. POST /api/v1/student/submit-test-data
    await testRoute("POST /api/v1/student/submit-test-data", () =>
      axios.post(
        `${BASE_URL}/api/v1/student/submit-test-data`,
        {
          testId,
          answers: { [questionId]: "Blue" },
          timeTakenSeconds: 15,
        },
        authHeaders
      )
    );

    console.log(`\n==================================================`);
    console.log(`📊 ENDPOINT TESTING SUMMARY`);
    console.log(`==================================================`);
    console.table(results);

  } catch (err) {
    console.error("❌ Test Script Error:", err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    console.log("\nServer closed & Database connection disconnected.");
  }
}

testEndpoints();
