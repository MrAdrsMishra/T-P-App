# Build an Extensible MongoDB Student Analytics & Ranking System

Implement the placement-engine analytics architecture using MongoDB + Mongoose.

## Core principle

Do NOT hardcode analytics around English, Coding, Aptitude, etc.

Everything must be represented through a generic `Metric` hierarchy so new categories, subjects, topics, skills, languages, and future dimensions can be added without changing the database schema or ranking engine.

## Collections

Create/modify these models:

1. Student
2. Metric
3. Question
4. Assessment
5. AssessmentAttempt
6. Answer
7. StudentMetricPerformance
8. RankingSnapshot

## Student

Store academic classification:

- courseId
- streamId
- branchId
- batchId

Use ObjectId references rather than free-form strings wherever possible.

## Metric

Create a hierarchical metric tree:

```text
English
 └── Grammar
      ├── Prepositions
      ├── Conditionals
      └── Tenses

Coding
 ├── C++
 │    ├── Arrays
 │    ├── Pointers
 │    └── DP
 ├── Python
 └── Java
```

Fields:

- name
- slug
- parentId
- ancestors
- isActive
- timestamps

Do not use a fixed enum for categories because future metrics must be supported dynamically.

## Question

Each question must support dynamic metric tagging.

Prefer tagging questions with the lowest meaningful metric:

```js
metrics: [
  {
    metricId,
    weight
  }
]
```

Example:

```text
Question → Prepositions
```

The analytics engine should roll performance upward:

```text
Prepositions → Grammar → English
```

Do not require the question to explicitly store every ancestor.

Support:

- question type
- text
- options where applicable
- marks
- negativeMarks
- difficulty
- metrics

## AssessmentAttempt

Store every student's individual assessment attempt.

Fields:

- studentId
- assessmentId
- status
- startedAt
- submittedAt
- obtainedMarks
- totalMarks
- percentage

Never replace historical attempts.

## Answer

Store every question-level response.

Fields:

- attemptId
- studentId
- questionId
- response
- isCorrect
- marksObtained
- timeTakenMs
- answeredAt

This is the source-of-truth layer.

## StudentMetricPerformance

Create aggregate documents keyed by:

```text
student + metric + period
```

Track:

- questionsAttempted
- questionsCorrect
- obtainedMarks
- totalMarks
- accuracy
- percentage
- attemptsCount
- lastAttemptAt
- updatedAt

Create a unique compound index on:

```text
studentId
metricId
period.type
period.key
```

Do not store weak/average/strong as authoritative data. Calculate it using configurable thresholds.

## RankingSnapshot

DO NOT store globalRank/courseRank/streamRank/etc. inside StudentStats.

Rank is contextual.

A ranking is determined by:

```text
Metric + Scope + Period + Student
```

RankingSnapshot fields:

- metricId
- studentId
- scope.type
- scope.id
- period.type
- period.key
- score
- rank
- totalParticipants
- calculatedAt
- version

Supported scope types:

- GLOBAL
- COURSE
- STREAM
- BRANCH
- BATCH
- CUSTOM

## Ranking API

Build a generic API:

```text
GET /rankings
```

Parameters should support:

```text
metricId
scopeType
scopeId
period
rankFrom
rankTo
page
limit
```

Example:

```text
metric = Prepositions
scope = CSE-AIML
rank = 11–25
```

must return students ranked 11 through 25 for Prepositions within CSE-AIML.

The exact same API must work for:

- English
- Grammar
- Prepositions
- C++
- Arrays
- DBMS
- OS
- Aptitude
- Projects
- future metrics

## Ranking Engine

Never implement logic such as:

```js
if (category === "English")
if (category === "Coding")
if (category === "Aptitude")
```

The ranking engine must be metric-agnostic.

Ranking should operate on a generic score supplied by StudentMetricPerformance.

Support a configurable tie strategy:

- competition ranking
- dense ranking

Clearly document which one is the default.

## Overall Score

Treat Overall as a configurable/synthetic metric.

Example:

```text
Aptitude     25%
English      20%
Coding       30%
CS           15%
Projects     10%
```

Do not hardcode these weights into the Student model.

Create a configurable scoring-profile mechanism so institutions/courses can change weights later.

## Performance hierarchy

A student's analytics should be able to display:

```text
English: 79%

  Grammar: 82%
    Prepositions: 80%
    Conditionals: 40%

  Reading: 76%
  Writing: 88%
  Speaking: 71%

Coding: 85%

  C++: 90%
  Python: 80%
  Java: 82%
```

The hierarchy must be generated from the Metric tree rather than hardcoded.

## Important architectural rule

Keep these layers separate:

```text
Raw:
AssessmentAttempt
Answer
Question

Derived:
StudentMetricPerformance

Ranking:
RankingSnapshot
```

RankingSnapshot is disposable/rebuildable derived data. Raw answers must remain intact.

## Indexing

Add indexes for:

- Student academic fields
- Question metric references
- AssessmentAttempt studentId + assessmentId
- Answer attemptId + questionId + studentId
- StudentMetricPerformance studentId + metricId + period
- RankingSnapshot metricId + scope + period + rank

Optimize leaderboard queries around:

```text
metricId
scope
period
rank
```

## Scalability

Do not calculate every leaderboard by joining StudentStats with Student on every request.

Use:

```text
Answers
   ↓
StudentMetricPerformance
   ↓
RankingSnapshot
```

for frequently requested rankings.

RankingSnapshot should be recalculable whenever performance changes or ranking is refreshed.

## Deliverable

Implement the Mongoose schemas, indexes, services, aggregation/update logic, ranking engine, and APIs.

Also include:

1. Seed metrics for English, Coding, Aptitude and CS Subjects.
2. Example questions tagged with metrics.
3. Example student performance calculation.
4. Example ranking calculation.
5. Example query for rank range 11–25.
6. Tests proving that adding a new metric such as `Generative AI → Prompt Engineering` requires no schema or ranking-engine modification.