 // src/services/judge0Client.js
import axios from "axios";
import base64 from "base-64";


const client = axios.create({
  baseURL: process.env.JUDGE0_BASE_URL,
  headers: {
    "x-rapidapi-key": process.env.JUDGE0-API-KEY,
    "x-rapidapi-host": process.env.JUDGE0-API-HOST,
    "Content-Type": "application/json",
  },
});

/* -----------------------------------------------------------
   Helper — Encode Base64 if required
----------------------------------------------------------- */
const encodeIfNeeded = (value, encode = true) => {
  if (!encode || !value) return value;
  return base64.encode(value);
};

/* -----------------------------------------------------------
   Generic wrapper for all Judge0 API calls
----------------------------------------------------------- */
const judge0Request = async (method, url, params = {}, data = {}) => {
  try {
    const response = await client({
      method,
      url,
      params,
      data,
    });

    return response.data;
  } catch (error) {
    console.error("Judge0 Error:", error?.response?.data || error.message);
    throw new Error("Judge0 API Error");
  }
};

/* -----------------------------------------------------------
   1️⃣ Create Single Submission
----------------------------------------------------------- */
 const createSubmission = async ({
  source_code,
  language_id,
  stdin = "",
  base64Encoded = true,
}) => {
  return judge0Request(
    "POST",
    "/submissions",
    {
      base64_encoded: base64Encoded,
      wait: false,
      fields: "*",
    },
    {
      language_id,
      source_code: encodeIfNeeded(source_code, base64Encoded),
      stdin: encodeIfNeeded(stdin, base64Encoded),
    }
  );
};

/* -----------------------------------------------------------
   2️⃣ Create Batch Submissions
----------------------------------------------------------- */
 const createBatchSubmission = async (submissions, base64Encoded = true) => {
  const formatted = submissions.map((s) => ({
    language_id: s.language_id,
    source_code: encodeIfNeeded(s.source_code, base64Encoded),
    stdin: encodeIfNeeded(s.stdin || "", base64Encoded),
  }));

  return judge0Request(
    "POST",
    "/submissions/batch",
    { base64_encoded: base64Encoded },
    { submissions: formatted }
  );
};

/* -----------------------------------------------------------
   3️⃣ Retrieve Single Submission
----------------------------------------------------------- */
 const getSubmission = async (token, base64Encoded = true) => {
  return judge0Request(
    "GET",
    `/submissions/${token}`,
    {
      base64_encoded: base64Encoded,
      fields: "*",
    }
  );
};

/* -----------------------------------------------------------
   4️⃣ Retrieve Batch Submissions
----------------------------------------------------------- */
 const getBatchSubmission = async (tokens, base64Encoded = true) => {
  return judge0Request(
    "GET",
    "/submissions/batch",
    {
      tokens: tokens.join(","),
      base64_encoded: base64Encoded,
      fields: "*",
    }
  );
};

/* -----------------------------------------------------------
   5️⃣ Get Available Languages
----------------------------------------------------------- */
 const getLanguages = async () => {
  return judge0Request("GET", "/languages");
};

/* -----------------------------------------------------------
   6️⃣ Get Judge0 Status Codes
----------------------------------------------------------- */
 const getStatuses = async () => {
  return judge0Request("GET", "/statuses");
};

export {
  getBatchSubmission,
  getLanguages,
  getStatuses,
  getSubmission,
  createSubmission,
  createBatchSubmission
}