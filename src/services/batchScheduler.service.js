import { Student } from "../models/user-models/student.models.js";
import { Metric } from "../models/analytics-models/Metric.models.js";
import { calculateRankingSnapshots } from "./analytics-services/rankingEngine.service.js";

let schedulerTimer = null;

/**
 * Executes hourly background batch processing:
 * 1. Queries all active metrics
 * 2. Recalculates leaderboard snapshots across supported scopes (GLOBAL, COURSE, STREAM, BRANCH, BATCH)
 */
export const runHourlyBatchSync = async () => {
  console.log("[BatchScheduler] Starting hourly metrics and leaderboard snapshot sync...");
  const startTime = Date.now();

  try {
    const activeMetrics = await Metric.find({ isActive: true }).select("_id slug name");
    console.log(`[BatchScheduler] Syncing ranking snapshots for ${activeMetrics.length} active metrics.`);

    const distinctCourses = await Student.distinct("course");
    const distinctStreams = await Student.distinct("stream");
    const distinctBranches = await Student.distinct("branch");
    const distinctBatches = await Student.distinct("batch");

    const scopes = [{ type: "GLOBAL", id: "ALL" }];

    distinctCourses.filter(Boolean).forEach((c) => scopes.push({ type: "COURSE", id: c }));
    distinctStreams.filter(Boolean).forEach((s) => scopes.push({ type: "STREAM", id: s }));
    distinctBranches.filter(Boolean).forEach((b) => scopes.push({ type: "BRANCH", id: b }));
    distinctBatches.filter(Boolean).forEach((bt) => scopes.push({ type: "BATCH", id: bt }));

    const periods = [
      { type: "ALL_TIME", key: "ALL" },
      { type: "MONTHLY", key: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` },
    ];

    let totalSnapshotsGenerated = 0;

    for (const metric of activeMetrics) {
      for (const scope of scopes) {
        for (const period of periods) {
          try {
            const snapshots = await calculateRankingSnapshots({
              metricId: metric._id,
              scopeType: scope.type,
              scopeId: scope.id,
              period,
              tieStrategy: "dense",
            });
            totalSnapshotsGenerated += snapshots.length;
          } catch (err) {
            console.error(
              `[BatchScheduler] Error calculating ranking snapshot for metric ${metric.slug} scope ${scope.type}:${scope.id}:`,
              err.message
            );
          }
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `[BatchScheduler] Hourly batch sync completed in ${duration}s. Generated ${totalSnapshotsGenerated} leaderboard snapshot entries.`
    );
  } catch (error) {
    console.error("[BatchScheduler] Batch sync failed:", error);
  }
};

/**
 * Initializes background scheduler on server startup
 */
export const initBatchScheduler = () => {
  console.log("[BatchScheduler] Initializing background analytics sync scheduler...");

  // Run initial batch sync after 10 seconds of startup
  setTimeout(() => {
    runHourlyBatchSync().catch((err) => console.error("[BatchScheduler] Initial run failed:", err));
  }, 10000);

  // Schedule hourly job (every 60 minutes = 3,600,000 ms)
  schedulerTimer = setInterval(() => {
    runHourlyBatchSync().catch((err) => console.error("[BatchScheduler] Scheduled run failed:", err));
  }, 3600000);

  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }
};
