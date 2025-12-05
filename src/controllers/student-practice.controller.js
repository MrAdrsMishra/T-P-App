import { asyncHandler } from "../utils/asyncHandler.js";
// import {
//   createSubmission,
//   getSubmission,
//   createBatchSubmission,
//   getBatchSubmission,
//   getLanguages,
//   getStatuses,
// } from "../services/Judge0-compiler/run-code.controller.js";

// export const handleCodeSubmitionRetrival = asyncHandler(async (req, res) => {
//   const { source_code, language_id, std_in } = req.body;
//   //   const {end_pt} = req.params;
//   try {
//     const submissionResponse = await createSubmission({
//       source_code,
//       language_id,
//       stdin: std_in,
//     });
//     let submissinoToken;
//     if (submissionResponse.status == 201) {
//       submissinoToken = submissionResponse.token;
//     }
//     const submissionOutputRetrivalResponse =
//       await getSubmission(submissinoToken);

//     if (submissionOutputRetrivalResponse.status == 201) {
//       submissinoToken = submissionResponse.token;
//     }
//   } catch (error) {}

//   res.status(200).json({
//     success: true,
//     token: submission.token,
//   });
// });

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { ApiResponse } from "../utils/ApiResponse.js";
import os from "os";

export const runCode = async (req, res) => {
  try {
    const { selectedLanguage, userCode, userInput } = req.body;
    // console.log({ selectedLanguage, userCode, userInput });
    // create a stable temp directory and write files inside it
    const tmpBase = os.tmpdir();
    const tempDir = fs.mkdtempSync(path.join(tmpBase, "code-run-"));
    const images = {
      cpp: "cpp-runner",
      python: "python-runner",
      go: "go-runner",
      rust: "rust-runner",
      javascript: "javascript-runner",
      java: "java-runner",
    };
    const imagesExtension = {
      cpp: "cpp",
      python: "py",
      go: "go",
      java: "java",
      javascript: "js",
      rust: "rs",
    };

    // Use language-appropriate filenames expected by the runner's run.sh
    const codeFilename = `code.${imagesExtension[selectedLanguage]}` || "code";
    const inputFilename = "input.txt";

    const codePath = path.join(tempDir, codeFilename);
    const inputPath = path.join(tempDir, inputFilename);

    fs.writeFileSync(codePath, userCode || "");
    fs.writeFileSync(inputPath, userInput || "");

    const image = images[selectedLanguage] || images.cpp;

    // Normalize mount path to use forward slashes (safer for Docker on Windows)
    const mountHostPath = tempDir.split(path.sep).join("/");

    // Mount the whole directory to /app/work so we do NOT hide the image's /app/run.sh
    const command = `docker run --rm -v "${mountHostPath}:/app/work" ${image}`;

    // console.log('Running docker command:', command);
    exec(
      command,
      { maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer
      (error, stdout, stderr) => {
        // Always attempt to return both stdout and stderr for debugging
        const out = stdout || null;
        const err = stderr || (error ? error.message : null);

        // Clean up temp dir
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error("Failed to remove temp dir:", cleanupErr);
        }

        // console.log('docker stdout:', out);
        // console.log('docker stderr:', err);
        // console.log('docker exec error:', error);

        return res.json({ command, output: out, error: err });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

// import { ApiError } from "../utils/ApiError";
// import { asyncHandler } from "../utils/asyncHandler";

// const handleCodeSubmitionRetrival=asyncHandler(async(req,res)=>{
//     const {source_code,language_id,std_in}= req.body;
//     const {}= req.params
//     const {} = req.headers
// })
// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'true'
//   },
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions: [
//       {
//         language_id: 46,
//         source_code: 'ZWNobyBoZWxsbyBmcm9tIEJhc2gK'
//       },
//       {
//         language_id: 71,
//         source_code: 'cHJpbnQoImhlbGxvIGZyb20gUHl0aG9uIikK'
//       },
//       {
//         language_id: 72,
//         source_code: 'cHV0cygiaGVsbG8gZnJvbSBSdWJ5IikK'
//       }
//     ]
//   }
// }
// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/languages',
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };
// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/statuses',
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     tokens: 'dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db',
//     base64_encoded: 'true',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/2e979232-92fd-4012-97cf-3e9177257d10',
//   params: {
//     base64_encoded: 'true',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };
// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions',
//   params: {
//     base64_encoded: 'true',
//     wait: 'false',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': '3a47d4d4b0msh48ac7be0ad46344p197b9fjsncaf356a00458',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     language_id: 52,
//     source_code: 'I2luY2x1ZGUgPHN0ZGlvLmg+CgppbnQgbWFpbih2b2lkKSB7CiAgY2hhciBuYW1lWzEwXTsKICBzY2FuZigiJXMiLCBuYW1lKTsKICBwcmludGYoImhlbGxvLCAlc1xuIiwgbmFtZSk7CiAgcmV0dXJuIDA7Cn0=',
//     stdin: 'SnVkZ2Uw'
//   }
// };
