import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  createSubmission,
  getLanguages,
  getSubmission,
} from "../Judge0-compiler/run-code.service.js";

export const runCodeNativeServicec= async(req, res) => {
  try {
    const req_data = req.body;
    const response = await fetch(`${process.env.COMPILER_API}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COMPILER_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req_data),
    });

    const data = await response.json();
    if (!response.ok) {
      return res
        .status(response.status || 500)
        .json(new ApiResponse(response.status || 500, null, data || "compiler error"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "compiled successfully"));
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
