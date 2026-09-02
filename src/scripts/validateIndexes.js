import mongoose from "mongoose";
import dotenv from "dotenv";
import { Metric } from "../models/analytics-models/Metric.models.js";
import { StudentMetricPerformance } from "../models/analytics-models/StudentMetricPerformance.models.js";
import { RankingSnapshot } from "../models/analytics-models/RankingSnapshot.models.js";
import { Question } from "../models/test-models/questions.models.js";

dotenv.config();

async function validateIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    console.log("\nValidating Metric Indexes...");
    await Metric.syncIndexes();
    const metricIndexes = await Metric.collection.indexes();
    console.log(metricIndexes);

    console.log("\nValidating StudentMetricPerformance Indexes...");
    await StudentMetricPerformance.syncIndexes();
    const smpIndexes = await StudentMetricPerformance.collection.indexes();
    console.log(smpIndexes);

    console.log("\nValidating RankingSnapshot Indexes...");
    await RankingSnapshot.syncIndexes();
    const rankingIndexes = await RankingSnapshot.collection.indexes();
    console.log(rankingIndexes);

    console.log("\nValidating Question Indexes...");
    await Question.syncIndexes();
    const questionIndexes = await Question.collection.indexes();
    console.log(questionIndexes);

    console.log("\nAll indexes synchronized and validated successfully.");
  } catch (error) {
    console.error("Error validating indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

validateIndexes();
