import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { ApiResponse } from "../utils/ApiResponse.js";
import os from "os";
import { stderr } from "process";

export const runCode = async (req, res) => {
  try {
    const { selectedLanguage, userCode, userInput } = req.body;
    const tmpBase = os.tmpdir();
    const tempDir = fs.mkdtempSync(path.join(tmpBase, "code-run-"));
    const images = {
      cpp: "mradrsmishra/compiler.com:cpp-runner",
      python: "mradrsmishra/compiler.com:python-runner",
      go: "mradrsmishra/compiler.com:go-runner",
      rust: "mradrsmishra/compiler.com:rust-runner",
      javascript: "mradrsmishra/compiler.com:javascript-runner",
      java: "mradrsmishra/compiler.com:java-runner",
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
    const codeFilename =
      `code.${imagesExtension[selectedLanguage]}` || "code.txt";
    const inputFilename = "input.txt";
    const codePath = path.join(tempDir, codeFilename);
    const inputPath = path.join(tempDir, inputFilename);
    console.log({codeFilename:codeFilename,inputFilename:inputFilename})
    fs.writeFileSync(codePath, userCode || "");
    fs.writeFileSync(inputPath, userInput || "");
    
    // Verify files were created
    const filesInTemp = fs.readdirSync(tempDir);
    console.log("Files in temp directory:", filesInTemp);
    console.log("Code file exists:", fs.existsSync(codePath));
    console.log("Input file exists:", fs.existsSync(inputPath));

    const image = images[selectedLanguage];
    console.log("tempDir: ", tempDir);
    const command = `docker run --rm -v "${tempDir}:/app/work" ${image}`;
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
        console.log({stdout:out,stderr:err,commandErr:error})
        return res.json({ command, output: out, error: err });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
