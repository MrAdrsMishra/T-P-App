import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  createSubmission,
  getLanguages,
  getSubmission,
} from "../Judge0-compiler/run-code.service.js";

export const runCodeNative = async (req, res) => {
  try {
    const req_data = req.body;
    const response = fetch("http://localhost:3000/v1/practice/run-code", {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(req_data),
    });
    console.log(response.JSON());
    return res
      .status(200)
      .json(new ApiResponse(200, response.JSON(), "compiled successfully"));
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
export const runCodeService = async ({ sourceCode, language }) => {
  const languages = await getLanguages();
  const language_id = languages[language];
  const submissionId = await createSubmission({ sourceCode, language_id });
  const output = await getSubmission(submissionId);
  return output;
};
