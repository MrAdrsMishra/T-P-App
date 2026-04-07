import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Student } from "../models/user-models/student.models.js";
import { Admin } from "../models/user-models/admin.models.js";
import { Question } from "../models/test-models/questions.models.js";
import { Test } from "../models/test-models/test.models.js";
import { Subject } from "../models/test-models/subject.models.js";
import { StudentStats } from "../models/user-models/StudentStats.models.js";
import { RankHistory } from "../models/user-models/RankHistory.models.js";
import dotenv from "dotenv";

dotenv.config();

const BRANCHES = ["CSE", "AIML", "EC", "EX", "DS", "CY", "AIDS", "BS"];
const BATCHES = ["2024", "2025", "2026"];
const SUBJECTS = [
  "Data Structures",
  "Algorithms",
  "Web Development",
  "Machine Learning",
  "Database Management",
  "Operating Systems",
  "System Design",
  "OOPs",
];

// Question templates
const questionTemplates = [
  {
    problemStatement: "What is the time complexity of binary search?",
    subject: "Algorithms",
  },
  {
    problemStatement: "Explain the concept of polymorphism in OOP.",
    subject: "OOPs",
  },
  {
    problemStatement: "What are the ACID properties in databases?",
    subject: "Database Management",
  },
  {
    problemStatement:
      "Design a system to handle 1 million concurrent users.",
    subject: "System Design",
  },
  {
    problemStatement: "What is the difference between process and thread?",
    subject: "Operating Systems",
  },
  {
    problemStatement: "Implement a REST API using Node.js and Express.",
    subject: "Web Development",
  },
  {
    problemStatement:
      "What is the gradient descent algorithm and how does it work?",
    subject: "Machine Learning",
  },
  {
    problemStatement: "Design a database schema for an e-commerce platform.",
    subject: "Database Management",
  },
  {
    problemStatement: "What are the different sorting algorithms?",
    subject: "Algorithms",
  },
  {
    problemStatement: "Explain the concept of inheritance in OOP.",
    subject: "OOPs",
  },
  {
    problemStatement: "What is the difference between SQL and NoSQL?",
    subject: "Database Management",
  },
  {
    problemStatement: "Design a URL shortener service.",
    subject: "System Design",
  },
  {
    problemStatement: "What are the different types of data structures?",
    subject: "Data Structures",
  },
  {
    problemStatement: "Build a React component with hooks.",
    subject: "Web Development",
  },
  {
    problemStatement: "What are convolutional neural networks?",
    subject: "Machine Learning",
  },
  {
    problemStatement:
      "What is virtual memory and how does it work in operating systems?",
    subject: "Operating Systems",
  },
  {
    problemStatement:
      "Implement a stack and queue data structure from scratch.",
    subject: "Data Structures",
  },
  {
    problemStatement: "What are authentication and authorization?",
    subject: "Web Development",
  },
  {
    problemStatement:
      "Explain the concept of backpropagation in neural networks.",
    subject: "Machine Learning",
  },
  {
    problemStatement: "Design a distributed cache system.",
    subject: "System Design",
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to database
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined");
    }

    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`);
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Student.deleteMany({});
    await Admin.deleteMany({});
    await Question.deleteMany({});
    await Test.deleteMany({});
    await Subject.deleteMany({});
    await StudentStats.deleteMany({});
    await RankHistory.deleteMany({});
    console.log("✓ Cleared all collections");

    // 1. Create Admins
    console.log("\n📝 Creating Admin users...");
    const adminUsers = [];
    for (let i = 1; i <= 3; i++) {
      const adminData = {
        fullName: `Admin User ${i}`,
        email: `admin${i}@placement.com`,
        password: "Admin@123",
        phone: `9876543${100 + i}`,
        collegeId: `COLLEGE00${i}`,
        role: "Admin",
      };
      const admin = new Admin(adminData);
      await admin.save();
      adminUsers.push(admin);
      console.log(`  ✓ Created Admin: ${admin.email}`);
    }

    // 2. Create Subjects
    console.log("\n📚 Creating Subjects...");
    const subjects = [];
    for (const subjectName of SUBJECTS) {
      const subject = new Subject({ subjectName: subjectName });
      await subject.save();
      subjects.push(subject);
      console.log(`  ✓ Created Subject: ${subjectName}`);
    }

    // 3. Create Questions
    console.log("\n❓ Creating Questions...");
    const questions = [];
    let subjectIndex = 0;
    for (const qTemplate of questionTemplates) {
      const subjectId = subjects[subjectIndex % subjects.length]._id;
      const question = new Question({
        subjectId: subjectId,
        topic: qTemplate.subject,
        problemStatement: qTemplate.problemStatement,
        difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)],
        allocatedMark: Math.floor(Math.random() * 5) + 1, // 1-5 marks
        questionType: "mcq",
      });
      await question.save();
      questions.push(question);
      subjectIndex++;
    }
    console.log(`  ✓ Created ${questions.length} Questions`);

    // 4. Create Tests
    console.log("\n📋 Creating Tests...");
    const tests = [];
    const testNames = [
      "Placement Preparation Test 1",
      "Data Structures Challenge",
      "Web Development Sprint",
      "ML Foundations Quiz",
      "System Design Interview Prep",
      "Mock Technical Interview 1",
      "Mock Technical Interview 2",
      "Final Assessment",
    ];

    for (let i = 0; i < testNames.length; i++) {
      const adminId = adminUsers[i % adminUsers.length]._id;
      const test = new Test({
        createdBy: adminId,
        title: testNames[i],
        description: `${testNames[i]} - Comprehensive assessment of core concepts`,
        instruction:
          "Attempt all questions. Each question has specific marks. Negative marking: -0.25 for wrong answers.",
        forBranch: [BRANCHES[Math.floor(Math.random() * BRANCHES.length)]],
        forBatch: BATCHES[Math.floor(Math.random() * BATCHES.length)],
        duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      await test.save();
      tests.push(test);
      console.log(`  ✓ Created Test: ${test.title}`);
    }

    // 5. Create Students
    console.log("\n👥 Creating Students...");
    const students = [];
    const firstNames = [
      "Aarav",
      "Bhavna",
      "Chetan",
      "Disha",
      "Eshan",
      "Farha",
      "Gautam",
      "Hira",
      "Ishan",
      "Jiya",
      "Karan",
      "Lara",
      "Mohit",
      "Neha",
      "Omkar",
      "Priya",
      "Qasim",
      "Riya",
      "Sameer",
      "Tarun",
    ];
    const lastNames = [
      "Singh",
      "Patel",
      "Kumar",
      "Sharma",
      "Gupta",
      "Verma",
      "Khan",
      "Mishra",
      "Iyer",
      "Reddy",
    ];

    for (let i = 0; i < 50; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const batch = BATCHES[Math.floor(Math.random() * BATCHES.length)];
      const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
      
      // Enrollment format: YYYYLLNNNNNN (e.g., 2024CS000001)
      // YYYY = batch year, LL = branch code, NNNNNN = student number
      const branchCode = branch.substring(0, 2).toUpperCase();
      const enrollmentNum = `${batch}${branchCode}${String(i + 1).padStart(6, "0")}`;

      const studentData = {
        fullName: `${firstName} ${lastName}`,
        email: `student.${i + 1}@placement.com`,
        password: "Student@123",
        phone: `98765${String(43210 + i).padStart(5, "0")}`,
        enrollment: enrollmentNum,
        branch: branch,
        batch: batch,
        role: "Student",
        about: "Passionate learner interested in software development and AI/ML.",
      };

      const student = new Student(studentData);
      await student.save();
      students.push(student);
    }
    console.log(`  ✓ Created ${students.length} Students`);

    // 6. Create Student Statistics
    console.log("\n📈 Creating Student Statistics...");
    for (let i = 0; i < Math.min(30, students.length); i++) {
      const student = students[i];
      const studentStats = new StudentStats({
        studentId: student._id,
        totalTests: Math.floor(Math.random() * 10) + 1,
        avgScore: Math.floor(Math.random() * 40) + 60,
        bestRank: Math.floor(Math.random() * 100) + 1,
      });
      await studentStats.save();
    }
    console.log(`  ✓ Created StudentStats for ${Math.min(30, students.length)} students`);

    // 7. Create Rank History
    console.log("\n🏆 Creating Rank History...");
    let rankHistoryCount = 0;
    
    for (let i = 0; i < Math.min(20, students.length); i++) {
      const student = students[i];

      for (let j = 0; j < Math.min(tests.length, 5); j++) {
        const testId = tests[j]._id;
        const rank = Math.floor(Math.random() * 50) + 1;
        const score = Math.floor(Math.random() * 100);
        const percentile = Math.floor((Math.random() * 100));
        const totalParticipants = Math.floor(Math.random() * 50) + 10;

        const rankHistory = new RankHistory({
          testId: testId,
          studentId: student._id,
          score: score,
          rank: rank,
          percentile: percentile,
          totalParticipants: totalParticipants,
        });
        
        try {
          await rankHistory.save();
          rankHistoryCount++;
        } catch (err) {
          // Skip duplicate entries (unique index constraint)
          if (!err.message.includes("duplicate")) {
            throw err;
          }
        }
      }
    }
    console.log(`  ✓ Created ${rankHistoryCount} RankHistory records`);

    // Summary
    console.log("\n✅ Database Seeding Complete!");
    console.log("\n📊 Summary:");
    console.log(`  - Admins: ${adminUsers.length}`);
    console.log(`  - Students: ${students.length}`);
    console.log(`  - Subjects: ${subjects.length}`);
    console.log(`  - Questions: ${questions.length}`);
    console.log(`  - Tests: ${tests.length}`);
    console.log(`  - StudentStats Records: ${Math.min(30, students.length)}`);
    console.log(`  - RankHistory Records: ${Math.min(20, students.length)}`);

    console.log("\n🔐 Demo Credentials:");
    console.log("\n  Admin Login:");
    console.log("    Email: admin1@placement.com");
    console.log("    Password: Admin@123");
    console.log("\n  Student Login:");
    console.log("    Email: student.1@placement.com");
    console.log("    Password: Student@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run seed function
seedDatabase();