# Migration Notes: Deprecating Legacy Analytics Models

This document outlines the steps for gracefully migrating data from deprecated legacy analytical collections to the new, modular metric-based system.

## Deprecated Collections
- `StudentStats`
- `CodingRankings`
- `RankHistory`
- `subjectRankHistory`

## Target Collection
- `StudentMetricPerformance` (for performance aggregation)
- `RankingSnapshot` (for ephemeral leaderboards)

## Migration Steps

### Phase 1: Metric Tree Generation
1. Identify all distinct legacy subjects, topics, and domains from the deprecated models (e.g., Coding, English, Aptitude).
2. Write a script to insert these into the `Metric` collection, establishing the correct `parentId` and `ancestors` hierarchy.

### Phase 2: Performance Aggregation Migration
1. Iterate over all existing `StudentStats` documents.
2. For each legacy category/subcategory/topic stat, query the corresponding `Metric` node (using its slug).
3. Upsert a record into `StudentMetricPerformance` with:
   - `studentId`: Copied from `StudentStats.studentId`.
   - `metricId`: The newly resolved `Metric` node ID.
   - `period`: `{ type: "ALL_TIME", key: "ALL" }`
   - `academic`: Extract `course`, `stream`, `branch`, and `batch` from the student's profile (or reference) and denormalize into this object.
   - Populate `questionsAttempted`, `questionsCorrect`, `totalMarks`, `obtainedMarks`, `accuracy`, and `percentage` based on the old stats.

### Phase 3: Ranking Transition
1. Do **not** migrate `CodingRankings`, `RankHistory`, or `subjectRankHistory` directly.
2. Ranking data is ephemeral. Rely on the newly migrated `StudentMetricPerformance` records.
3. Once Phase 2 is complete, trigger the cron jobs or scripts responsible for generating the `RankingSnapshot` to compute the new leaderboards.

### Phase 4: Verification and Cleanup
1. Ensure the UI can fetch student performance and leaderboards correctly via the new collections.
2. Drop the deprecated collections from MongoDB.
3. Remove the legacy Mongoose model files from the `src/models/user-models/` directory (these have already been unexported from `index.js`).
