# API Documentation

## Base Information
- **Base URL**: `http://localhost:3000/api` (or your deployment URL)
- **Response Format**: JSON
- **Authentication**: JWT Token (Bearer token in Authorization header)
- **Content-Type**: `application/json`

---

## Authentication

### Login
**Endpoint**: `POST /login`

**Description**: Authenticate user and receive access token

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student" // or "admin"
}
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "user@example.com",
      "role": "student",
      "batch": "2024",
      "branch": "CSE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User logged in successfully"
}
```

**Cookies Set**:
- `accessToken`: JWT token (httpOnly, secure, sameSite=strict)
- `refreshToken`: Refresh token (httpOnly, secure, sameSite=strict)

**Error Responses**:
- `400`: Email and password are required
- `404`: User with provided email does not exist
- `401`: Invalid credentials

---

### Logout
**Endpoint**: `POST /logout`

**Description**: Logout user and clear tokens

**Authentication**: Required ✅

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": null,
  "message": "User logged out successfully"
}
```

---

## User Profile

### Update User Profile
**Endpoint**: `POST /update-user-profile`

**Description**: Update user profile with personal and social information

**Authentication**: Required ✅

**Request Body** (multipart/form-data):
```
- profilePic: File (optional, image file)
- email: string (optional)
- username: string (optional)
- batch: string (optional)
- branch: string (optional)
- mobile: string (optional, 10 digits)
- github: string (optional, GitHub username)
- leetcode: string (optional, LeetCode username)
- gfg: string (optional, GeeksforGeeks username)
- linkedin: string (optional, LinkedIn URL)
- about: string (optional, bio/about text)
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "photo": "https://cloudinary.url/...",
    "about_yourself": "Software developer",
    "social_links": {
      "Github": "github_username",
      "Leetcode": "leetcode_username",
      "GeekForGeeks": "gfg_username",
      "LinkedIn": "linkedin_url"
    },
    "batch": "2024",
    "branch": "CSE"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses**:
- `400`: Phone number is invalid (must be 10 digits)
- `400`: Email is invalid
- `500`: Something went wrong while uploading on cloudinary

---

## Admin Endpoints

### Register Admin
**Endpoint**: `POST /register-admin`

**Description**: Register a new admin user

**Authentication**: Not required

**Request Body**:
```json
{
  "fullName": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123",
  "role": "admin"
}
```

**Response** (201 Created):
```json
{
  "statusCode": 201,
  "data": {
    "_id": "admin_id",
    "fullName": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  },
  "message": "Admin registered successfully"
}
```

**Error Responses**:
- `400`: All fields are required
- `409`: Admin with provided credential already exists!

---

### Register Students
**Endpoint**: `POST /register-student`

**Description**: Register multiple students in bulk

**Authentication**: Required ✅ (Admin only)

**Request Body** (array of objects):
```json
[
  {
    "fullName": "Student 1",
    "email": "student1@example.com",
    "enrollment": "2024CSE001"
  },
  {
    "fullName": "Student 2",
    "email": "student2@example.com",
    "enrollment": "2024CSE002"
  }
]
```

**Response** (201 Created):
```json
{
  "statusCode": 201,
  "data": [
    {
      "_id": "student_id_1",
      "fullName": "Student 1",
      "email": "student1@example.com",
      "enrollment": "2024CSE001"
    }
  ],
  "message": "Students registered successfully"
}
```

**Error Responses**:
- `400`: Request body must be a non-empty array
- `401`: Each student must have fullName, email and enrollment
- `409`: Some students already exist

---

### Delete Student
**Endpoint**: `POST /delete-student`

**Description**: Delete a student from the system

**Authentication**: Required ✅ (Admin only)

**Request Body**:
```json
{
  "studentName": "Student Full Name"
}
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "_id": "student_id",
    "fullName": "Student Full Name",
    "email": "student@example.com"
  },
  "message": "Student removed from the database successfully!"
}
```

**Error Responses**:
- `400`: Student ID is required
- `404`: Student not found. Deletion failed.

---

## Problem Management

### Create Problem Set
**Endpoint**: `POST /admin/create-problem-set`

**Description**: Create multiple problems for a test

**Authentication**: Required ✅ (Admin only)

**Request Body** (array of objects):
```json
[
  {
    "subject": "Data Structures",
    "problemStatement": "Write a function to find the longest substring without repeating characters.",
    "options": "Option A, Option B, Option C, Option D",
    "correctOption": "Option B",
    "allocatedMark": 5
  },
  {
    "subject": "Algorithms",
    "problemStatement": "What is the time complexity of quicksort in worst case?",
    "options": "O(n), O(n log n), O(n^2), O(log n)",
    "correctOption": "O(n^2)",
    "allocatedMark": 3
  }
]
```

**Notes**:
- `options`: Comma-separated string of options
- `allocatedMark`: Must be a positive number
- `correctOption`: Should match one of the options provided

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Problems created successfully"
}
```

**Error Responses**:
- `400`: Request body must be a non-empty array
- `401`: Each problem must have subject, problemStatement, options, correctOption and allocatedMark
- `401`: allocatedMark must be a positive number

---

### Get Problems by Subject
**Endpoint**: `GET /get-problem-set`

**Description**: Retrieve problems for a specific subject

**Authentication**: Required ✅ (Admin only)

**Request Body**:
```json
{
  "subject": "Data Structures"
}
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "problem_id_1",
      "subject": "Data Structures",
      "problemStatement": "Write a function...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": "Option B",
      "allocatedMark": 5
    }
  ],
  "message": "Problems retrieved successfully"
}
```

---

## Test Management

### Create Test
**Endpoint**: `POST /admin/create-test`

**Description**: Create a new test with multiple problems

**Authentication**: Required ✅ (Admin only)

**Request Body**:
```json
{
  "testData": {
    "title": "Data Structures Basics",
    "for_branch": "CSE",
    "for_batch": "2024",
    "categories": ["Data Structures", "Algorithms"],
    "duration": 60,
    "numberOfQuestions": 5,
    "total_marks": 100,
    "description": "Test to assess basic knowledge of data structures",
    "instructions": "Read each question carefully. You have 60 minutes to complete the test.",
    "problemsByCategory": {
      "Data Structures": [
        {
          "problemStatement": "What is a linked list?",
          "options": ["A sequential data structure", "..."],
          "correctOption": "A sequential data structure",
          "markAllocated": 10
        }
      ],
      "Algorithms": [
        {
          "problemStatement": "What is the best case complexity of bubble sort?",
          "options": ["O(n)", "O(n^2)", "O(log n)"],
          "correctOption": "O(n)",
          "markAllocated": 5
        }
      ]
    }
  }
}
```

**Response** (201 Created):
```json
{
  "statusCode": 201,
  "data": {
    "_id": "test_id",
    "title": "Data Structures Basics",
    "for_branch": "CSE",
    "for_batch": "2024",
    "subjects": ["Data Structures", "Algorithms"],
    "duration": 60,
    "total_marks": 100,
    "valid_till": "2024-02-09T10:00:00Z",
    "problems": ["problem_id_1", "problem_id_2"],
    "description": "Test to assess basic knowledge of data structures",
    "instructions": "Read each question carefully...",
    "total_questions": 5
  },
  "message": "Test created successfully"
}
```

**Note**: `valid_till` is automatically set to 2 days from creation

**Error Responses**:
- `400`: Test data is required
- `401`: Test title is required
- `401`: Select a valid branch
- `401`: Select a valid batch
- `401`: At least one category is required
- `401`: Valid test duration is required
- `401`: Valid number of questions is required
- `401`: Test description is required
- `401`: Test instructions are required
- `401`: Problems for each category are required

---

## Student Test Operations

### Get Ongoing Tests
**Endpoint**: `GET /student/get-all-ongoing-tests`

**Description**: Get list of all ongoing tests available for the student

**Authentication**: Required ✅

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "test_id_1",
      "title": "Data Structures Basics",
      "for_branch": "CSE",
      "for_batch": "2024",
      "duration": 60,
      "total_marks": 100,
      "valid_till": "2024-02-09T10:00:00Z",
      "description": "Test to assess basic knowledge",
      "total_questions": 5
    }
  ],
  "message": "Ongoing tests retrieved successfully"
}
```

---

### Get Test Data (with Problems)
**Endpoint**: `GET /student/get-test-data`

**Description**: Get full test details with all problems

**Authentication**: Required ✅

**Query Parameters**:
```
testId=test_id_123
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "_id": "test_id",
    "title": "Data Structures Basics",
    "for_branch": "CSE",
    "for_batch": "2024",
    "duration": 60,
    "total_marks": 100,
    "valid_till": "2024-02-09T10:00:00Z",
    "description": "Test to assess basic knowledge",
    "instructions": "Read each question carefully...",
    "total_questions": 5,
    "problems": [
      {
        "_id": "problem_id_1",
        "problemStatement": "What is a linked list?",
        "options": ["Option A", "Option B", "Option C"],
        "allocatedMark": 10
      }
    ]
  },
  "message": "Test data retrieved successfully"
}
```

**Note**: `correctOption` is NOT returned to prevent cheating

**Error Responses**:
- `400`: testId query parameter is required
- `404`: Test not found

---

### Submit Test
**Endpoint**: `POST /student/submit-test-data`

**Description**: Submit test answers and get score

**Authentication**: Required ✅

**Request Body**:
```json
{
  "testId": "test_id_123",
  "answers": {
    "problem_id_1": "Option A",
    "problem_id_2": "Option B",
    "problem_id_3": "Option C"
  }
}
```

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": 25,
  "message": "Test submitted successfully."
}
```

**Notes**:
- `data` contains the score obtained out of total marks
- Only provided answers are compared; missing answers get 0 marks
- Score calculation: Sum of `allocatedMark` for all correct answers

**Error Responses**:
- `400`: Test ID and answers are required
- `404`: Test not found

---

## Code Execution (Practice)

### Run Code
**Endpoint**: `POST /student/run-code`

**Description**: Execute code and get output

**Authentication**: May be required (check implementation)

**Request Body**:
```json
{
  "sourceCode": "def hello():\n    print('Hello World')",
  "language": "python",
  "userInput": "optional input"
}
```

**Supported Languages**: `javascript`, `python`, `java`, `cpp`, `c`, etc. (depends on Judge0 API)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "stdout": "Hello World\n",
    "stderr": "",
    "compile_output": "",
    "exit_code": 0,
    "status": {
      "id": 3,
      "description": "Accepted"
    }
  },
  "message": "code executes successfully"
}
```

**Error Responses**:
- `400`: sourceCode and language are required
- `500`: Compilation/Execution error

---

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": error_code,
  "data": null,
  "message": "Error description"
}
```

**Common Status Codes**:
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Server Error

---

## Authentication Headers

For protected endpoints, include the Authorization header:

```
Authorization: Bearer {accessToken}
```

Or the token will be read from cookie automatically if set via login.

---

## Field Validation Rules

| Field | Type | Validation |
|-------|------|-----------|
| email | string | Must be valid email format |
| password | string | Minimum length: 6 characters |
| phone/mobile | string | Exactly 10 digits |
| role | string | `admin` or `student` |
| allocatedMark | number | Must be positive (> 0) |
| duration | number | Duration in minutes |
| batch | string | Academic batch (e.g., 2024) |
| branch | string | Branch (e.g., CSE, ECE) |

---

## Important Notes for Frontend Developers

1. **Token Management**: Store `accessToken` in memory/state. `refreshToken` is stored in httpOnly cookies automatically.

2. **Error Handling**: Always check `statusCode` field. If not 200/201, treat as error.

3. **Profile Picture**: Use `multipart/form-data` for profile updates. Image will be uploaded to Cloudinary.

4. **Test Answers Format**: Use problem IDs as keys in the answers object:
   ```json
   {
     "66a7c8f9e4b0a1b2c3d4e5f6": "Option A",
     "66a7c8f9e4b0a1b2c3d4e5f7": "Option B"
   }
   ```

5. **Test Validity**: Always check `valid_till` timestamp before allowing test submission.

6. **Cookie-based Auth**: Cookies are set automatically on login. No manual token management needed in headers for most cases.

7. **CORS**: Ensure frontend URL is whitelisted in backend CORS configuration.

---

## Future Endpoints (To be implemented)

- `POST /student/submit-solution` - Submit coding solution
- `GET /student/get-analytics` - Student performance analytics
- `POST /student/submit-query` - Submit doubt/query
- `GET /student/get-resources` - Get study resources
- `GET /student/get-test-history` - Get past test records
- `POST /admin/create-resource` - Create study materials
- `POST /admin/create-assignment` - Create assignments
- `GET /admin/get-query` - Get student queries
- `POST /admin/response-query` - Respond to queries
- `GET /admin/get-student-details` - Get student information
- `GET /admin/get-student-projects` - Get student projects
- `GET /admin/get-analytics` - Platform analytics

---

## Example Frontend Implementation (React)

```javascript
// Login
const login = async (email, password, role) => {
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    credentials: 'include', // Important: include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  return response.json();
};

// Protected request
const getTests = async () => {
  const response = await fetch('http://localhost:3000/api/student/get-all-ongoing-tests', {
    method: 'GET',
    credentials: 'include', // Include cookies with token
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

// File upload
const updateProfile = async (formData) => {
  const response = await fetch('http://localhost:3000/api/update-user-profile', {
    method: 'POST',
    credentials: 'include',
    body: formData // Don't set Content-Type; browser will set it
  });
  return response.json();
};
```

---