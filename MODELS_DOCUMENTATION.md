# Database Schema Documentation

## Complete Models Overview

### 1. **Admin** (`admin.models.js`)
- **Primary Key**: `_id` (default MongoDB)
- **Fields**:
  - `fullName`: String (required, indexed)
  - `email`: String (required, unique, indexed)
  - `password`: String (required, bcrypt hashed)
  - `phone`: String (optional)
  - `collegeId`: String (optional)
  - `subjects`: ObjectId[] (references Subject)
  - `role`: String (default: "Admin")
  - `refreshToken`: String

**Relationships**:
- ONE Admin → MANY Tests (via `createdBy`)
- ONE Admin → MANY Resources (via `createdBy`)
- ONE Admin → MANY QueryMessages (via `resolvedBy`)

---

### 2. **Student** (`student.models.js`)
- **Primary Key**: `_id` (default MongoDB)
- **Fields**:
  - `fullName`: String (required)
  - `about`: String (optional)
  - `email`: String (required, unique, indexed)
  - `password`: String (required, bcrypt hashed)
  - `phone`: String (10 digits format)
  - `enrollment`: String (required, unique, indexed - format: `\d{4}[A-Z]{2}\d{6}`)
  - `branch`: String (default: "N/A")
  - `batch`: String
  - `role`: String (default: "Student")
  - `photo`: String (URL)
  - `totalTestAppeared`: Number (default: 0)
  - `avgScore`: Number (default: 0)
  - `lastTestDate`: Date
  - `refreshToken`: String
  - `socialLinks`: Map<String, String> (LinkedIn, GitHub, etc.)
  - `timestamps`: Auto-managed

**Relationships**:
- ONE Student → ONE SocialLinks (via `studentId`)
- ONE Student → ONE StudentStats (via `studentId`)
- ONE Student → MANY StudentProjects (via `ownerStudentId`)
- ONE Student → MANY ProjectContributors (via `studentId`)
- ONE Student → MANY TestAttempts (via `studentId`)
- ONE Student → MANY RankHistory (via `studentId`)
- ONE Student → MANY SubjectRankHistory (via `studentId`)
- ONE Student → MANY QueryMessages (via `studentId`)

---

### 3. **Subject** (`subject.model.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `subjectName`: String (required, unique, indexed)
  - `description`: String (optional)
  - `icon`: String (optional)
  - `timestamps`: Auto-managed

**Relationships**:
- ONE Subject → MANY TestSubjects
- ONE Subject → MANY Questions
- ONE Subject → MANY AttemptedTestSubjectScores
- ONE Subject → MANY SubjectRankHistories

---

### 4. **Test** (`test.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `createdBy`: ObjectId (FK to Admin, required)
  - `title`: String (required)
  - `description`: String (required)
  - `instruction`: String
  - `forBranch`: String[] (required, enum: ["AIML", "CSE", "EC", "EX", "DS", "CY", "AIDS", "BS"])
  - `forBatch`: String (default: current year)
  - `duration`: Number (in minutes, default: 30)
  - `totalQuestions`: Number (default: 20)
  - `totalMarks`: Number (default: 100)
  - `validTill`: Date (required)
  - `status`: String (enum: ["draft", "published", "archived"], default: "published")
  - `subjects`: ObjectId[] (references Subject)
  - `problems`: ObjectId[] (references Question)
  - `timestamps`: Auto-managed

**Relationships**:
- ONE Test → ONE TestMeta
- ONE Test → MANY TestSubjects
- ONE Test → MANY Questions
- ONE Test → MANY TestAttempts
- ONE Test → MANY RankHistories
- ONE Test → MANY SubjectRankHistories

---

### 5. **TestMeta** (`TestMeta.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `averageScore`: Number (default: 0)
  - `subjects`: String[]
  - `averageTimeTaken`: Number (in minutes, default: 0)
  - `highestScore`: Number (default: 0)
  - `totalMarks`: Number (default: 0)
  - `totalParticipants`: Number (default: 0)
  - `timestamps`: Auto-managed

---

### 6. **Question** (`questions.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `subjectId`: ObjectId (FK to Subject, required)
  - `statement`: String (required)
  - `problemStatement`: String (optional)
  - `difficulty`: String (enum: ["easy", "medium", "hard"], default: "medium")
  - `allocatedMark`: Number (default: 1)
  - `totalMarks`: Number (default: 1)
  - `questionType`: String (enum: ["mcq", "coding", "essay", "short-answer"], default: "mcq")
  - `explanation`: String
  - `orderInTest`: Number
  - `timestamps`: Auto-managed
  - **Index**: (testId, subjectId)

**Relationships**:
- ONE Question → MANY QuestionOptions

---

### 7. **Option** (`option.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `optionValue`: String (required)
  - `optionCode`: String (optional)
  - `explanation`: String (optional)
  - `timestamps`: Auto-managed

**Relationships**:
- ONE Option → MANY QuestionOptions

---

### 8. **QuestionOption** (`questionOption.models.js`)
- **Primary Key**: Composite (questionId + optionId, unique)
- **Fields**:
  - `questionId`: ObjectId (FK to Question, required)
  - `optionId`: ObjectId (FK to Option, required)
  - `isCorrect`: Boolean (default: false)
  - `optionOrder`: Number (required)
  - `timestamps`: Auto-managed

---

### 9. **TestSubject** (`testSubject.models.js`)
- **Primary Key**: Composite (testId + subjectId, unique)
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `subjectId`: ObjectId (FK to Subject, required)
  - `maxMarks`: Number (default: 25)
  - `totalQuestions`: Number (default: 10)
  - `questionIds`: ObjectId[] (references Question)
  - `timestamps`: Auto-managed

---

### 10. **TestAttempt** (`testAttempts.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `studentId`: ObjectId (FK to Student, required)
  - `testId`: ObjectId (FK to Test, required)
  - `testScore`: Number (default: 0)
  - `timeTaken`: Number (in seconds, default: 0)
  - `attemptDate`: Date (default: now)
  - `status`: String (enum: ["pending", "submitted", "evaluated"], default: "pending")
  - `totalQuestions`: Number (default: 0)
  - `correctAnswers`: Number (default: 0)
  - `wrongAnswers`: Number (default: 0)
  - `skippedAnswers`: Number (default: 0)
  - `timestamps`: Auto-managed
  - **Indexes**: 
    - (studentId, testId)
    - (studentId, attemptDate DESC)
    - (testId, attemptDate DESC)

**Relationships**:
- ONE TestAttempt → MANY AttemptedTestSubjectScores

---

### 11. **AttemptedTestSubjectScore** (`attemptedTestSubjectScore.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `studentId`: ObjectId (FK to Student, required)
  - `subjectId`: ObjectId (FK to Subject, required)
  - `attemptId`: ObjectId (FK to TestAttempt, required)
  - `subjectScore`: Number (default: 0)
  - `subjectMaxMarks`: Number (default: 25)
  - `percentage`: Number (default: 0)
  - `correctAnswers`: Number (default: 0)
  - `totalQuestions`: Number (default: 0)
  - `timestamps`: Auto-managed
  - **Index**: (testId, studentId, subjectId)

---

### 12. **RankHistory** (`RankHistory.models.js`)
- **Primary Key**: Composite (testId + studentId, unique)
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `studentId`: ObjectId (FK to Student, required)
  - `score`: Number (required)
  - `rank`: Number (required)
  - `percentile`: Number (required)
  - `totalParticipants`: Number (default: 0)
  - `timestamps`: Auto-managed

---

### 13. **SubjectRankHistory** (`subjectRankHistory.models.js`)
- **Primary Key**: Composite (testId + subjectId + studentId, unique)
- **Fields**:
  - `testId`: ObjectId (FK to Test, required)
  - `subjectId`: ObjectId (FK to Subject, required)
  - `studentId`: ObjectId (FK to Student, required)
  - `subjectScore`: Number (required)
  - `rank`: Number (required)
  - `percentile`: Number (required)
  - `totalParticipants`: Number (default: 0)
  - `timestamps`: Auto-managed

---

### 14. **StudentProject** (`studentProject.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `projectName`: String (required)
  - `projectLink`: String (optional)
  - `projectDesc`: String (optional)
  - `ownerStudentId`: ObjectId (FK to Student, required)
  - `projectStatus`: String (enum: ["active", "completed", "archived"], default: "active")
  - `dateStarted`: Date (default: now)
  - `dateCompleted`: Date (optional)
  - `technologies`: String[] (optional)
  - `tags`: String[] (optional)
  - `timestamps`: Auto-managed

**Relationships**:
- ONE StudentProject → MANY ProjectContributors

---

### 15. **ProjectContributors** (`projectContributers.models.js`)
- **Primary Key**: Composite (projectId + studentId, unique)
- **Fields**:
  - `projectId`: ObjectId (FK to StudentProject, required)
  - `studentId`: ObjectId (FK to Student, required)
  - `role`: String (enum: ["owner", "contributor"], default: "contributor", required)
  - `joinedDate`: Date (default: now)
  - `timestamps`: Auto-managed

---

### 16. **SocialLinks** (`socialLinks.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `studentId`: ObjectId (FK to Student, required, unique)
  - `linkedin`: String (optional)
  - `github`: String (optional)
  - `gfg`: String (optional)
  - `leetcode`: String (optional)
  - `hackerrank`: String (optional)
  - `portfolio`: String (optional)
  - `timestamps`: Auto-managed

---

### 17. **StudentStats** (`StudentStats.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `studentId`: ObjectId (FK to Student, required, unique)
  - `totalTests`: Number (default: 0)
  - `avgScore`: Number (default: 0)
  - `bestRank`: Number (default: 0)
  - `totalPercentile`: Number (default: 0)
  - `correctAnswers`: Number (default: 0)
  - `subjects`: Array of:
    - `subjectId`: ObjectId (references Subject)
    - `avgScore`: Number
    - `bestRank`: Number
  - `timestamps`: Auto-managed

---

### 18. **QueryMessage** (`queryMessage.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `studentId`: ObjectId (FK to Student, required)
  - `queryTitle`: String (required)
  - `queryDescription`: String (required)
  - `queryCategory`: String (enum: ["technical", "placement", "general", "other"], default: "general")
  - `queryStatus`: String (enum: ["open", "in-progress", "resolved", "closed"], default: "open")
  - `resolvedBy`: ObjectId (FK to Admin, optional)
  - `resolution`: String (optional)
  - `queryDate`: Date (default: now)
  - `resolvedDate`: Date (optional)
  - `priority`: String (enum: ["low", "medium", "high", "urgent"], default: "medium")
  - `timestamps`: Auto-managed

---

### 19. **Resource** (`resource.models.js`)
- **Primary Key**: `_id`
- **Fields**:
  - `resourceTitle`: String (required)
  - `resourceDescription`: String (optional)
  - `resourceLink`: String (required)
  - `createdBy`: ObjectId (FK to Admin, required)
  - `batch`: String (optional)
  - `branch`: String[] (enum branches, optional)
  - `resourceCategory`: String (enum: ["hiring", "learning", "internship", "other"], required)
  - `datePosted`: Date (default: now)
  - `urgency`: String (enum: ["low", "medium", "high", "critical"], default: "medium")
  - `expiryDate`: Date (optional)
  - `tags`: String[] (optional)
  - `views`: Number (default: 0)
  - `timestamps`: Auto-managed

---

## Relationship Summary

```
ADMIN
├── 1:N → Test (createdBy)
├── 1:N → Resource (createdBy)
└── 1:N → QueryMessage (resolvedBy)

STUDENT
├── 1:1 → SocialLinks
├── 1:1 → StudentStats
├── 1:N → StudentProject (ownerStudentId)
├── 1:N → ProjectContributors
├── 1:N → TestAttempt
├── 1:N → RankHistory
├── 1:N → SubjectRankHistory
└── 1:N → QueryMessage

SUBJECT
├── 1:N → TestSubject
├── 1:N → Question
├── 1:N → AttemptedTestSubjectScore
└── 1:N → SubjectRankHistory

TEST
├── 1:1 → TestMeta
├── 1:N → TestSubject
├── 1:N → Question
├── 1:N → TestAttempt
├── 1:N → RankHistory
└── 1:N → SubjectRankHistory

QUESTION
└── 1:N → QuestionOption

OPTION
└── 1:N → QuestionOption

STUDENTPROJECT
└── 1:N → ProjectContributors

TESTATTEMPT
└── 1:N → AttemptedTestSubjectScore
```

---

## Key Design Decisions

1. **Composite Primary Keys** used for many-to-many relationships:
   - QuestionOption (questionId + optionId)
   - TestSubject (testId + subjectId)
   - ProjectContributors (projectId + studentId)
   - RankHistory (testId + studentId)
   - SubjectRankHistory (testId + subjectId + studentId)

2. **Indexes** added for frequently queried combinations:
   - Question: (testId, subjectId)
   - TestAttempt: (studentId, testId), (studentId, attemptDate), (testId, attemptDate)
   - AttemptedTestSubjectScore: (testId, studentId, subjectId)

3. **Denormalization** for performance:
   - TestMeta stores aggregated test statistics
   - StudentStats stores student performance metrics
   - AttemptedTestSubjectScore stores calculated percentages

4. **ES6 Modules**: All models use consistent ES6 export syntax for modern JavaScript

5. **Timestamps**: All models include automatic `createdAt` and `updatedAt` fields

---

## Usage Example

```javascript
// Import all models
import { Admin } from './models/admin.models.js';
import { Student } from './models/student.models.js';
import { Test } from './models/test.models.js';
import { TestAttempt } from './models/testAttempts.models.js';
// ... other models

// Query with population
const testWithMeta = await Test.findById(testId)
  .populate('createdBy', 'fullName email')
  .populate('subjects', 'subjectName')
  .populate('problems');

const studentAttempts = await TestAttempt.find({ studentId })
  .populate('testId', 'title totalMarks')
  .sort({ attemptDate: -1 });
```

