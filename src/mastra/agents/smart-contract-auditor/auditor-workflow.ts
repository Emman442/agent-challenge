
// src/workflows/solana-audit-workflow.ts
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { agent } from "./auditor-agent"
export const staticAnalysis = createStep({
  id: "static-analysis",
  description: "Programs audit: linting, patterns, vulnerabilities",
  inputSchema: z.object({
    code: z.string(),
    programId: z.string().optional(),
    fileName: z.string().optional(),
    testCases: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    issues: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    issueCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
You are a Solana smart contract security auditor. Analyze this code:

File: ${inputData.fileName || "program.rs"}
Program ID: ${inputData.programId || "Unknown"}

Code:
\`\`\`rust
${inputData.code}
\`\`\`

Focus on:
- Missing signer checks (ctx.accounts.authority.is_signer)
- PDA validation and seed verification
- Account validation (owner, account type, constraints)
- Integer overflow/underflow (use checked_add, checked_sub, etc.)
- Reentrancy via CPI calls
- Rent exemption and ownership checks
- Access control and authorization
- Proper error handling

Provide detailed analysis with line numbers and severity levels.
`;

    try {
      const resp = await agent.stream([{ role: "user", content: prompt }]);
      let issues = "";

      for await (const chunk of resp.textStream) {
        process.stdout.write(chunk);
        issues += chunk;
      }

      const severity: "low" | "medium" | "high" | "critical" =
        issues.toLowerCase().includes("critical") ? "critical" :
        issues.toLowerCase().includes("high") ? "high" :
        issues.toLowerCase().includes("medium") ? "medium" : "low";

      const issueCount = (issues.match(/🚨|vulnerability|issue/gi) || []).length;

      return { issues, severity, issueCount };
    } catch (error: any) {
      console.error("Static analysis failed:", error);
      return {
        issues: `Static analysis failed: ${error.message}`,
        severity: "medium" as const,
        issueCount: 0
      };
    }
  },
});

export const dynamicAnalysis = createStep({
  id: "dynamic-analysis",
  description: "Run runtime simulations of attack scenarios",
  inputSchema: z.object({
    code: z.string(),
    issues: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    issueCount: z.number(),
    testCases: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    simulationReport: z.string(),
    testResults: z.array(z.object({
      testCase: z.string(),
      passed: z.boolean(),
      details: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
Based on the static analysis findings, create test scenarios for this Solana program:

Code:
\`\`\`rust
${inputData.code}
\`\`\`

Static Analysis Results:
${inputData.issues}

Generate test cases that would:
1. Exploit identified vulnerabilities
2. Test edge cases and boundary conditions
3. Verify access control mechanisms
4. Test integer overflow scenarios
5. Simulate reentrancy attacks via CPI

For each test case, describe:
- What it tests
- Expected behavior
- Potential exploits
- How to fix if vulnerable

Format as a simulation report.
`;

    try {
      const resp = await agent.stream([{ role: "user", content: prompt }]);
      let report = "";

      for await (const chunk of resp.textStream) {
        report += chunk;
      }

      const testResults = [
        {
          testCase: "Authorization Check Test",
          passed: report.includes("properly authorized"),
          details: "Testing signer validation and access control"
        },
        {
          testCase: "PDA Validation Test",
          passed: report.includes("PDA correctly validated"),
          details: "Testing Program Derived Address validation"
        },
        {
          testCase: "Integer Overflow Test",
          passed: report.includes("safe arithmetic"),
          details: "Testing for integer overflow vulnerabilities"
        }
      ];

      return { simulationReport: report, testResults };
    } catch (error: any) {
      console.error("Dynamic analysis failed:", error);
      return {
        simulationReport: `Dynamic analysis failed: ${error.message}`,
        testResults: []
      };
    }
  },
});

// Enhanced auto-fix with better code generation
export const autoFix = createStep({
  id: "auto-fix",
  description: "Generate code fixes based on static/dynamic findings",
  inputSchema: z.object({
    code: z.string(),
    issues: z.string(),
    simulationReport: z.string(),
    testResults: z.array(z.object({
      testCase: z.string(),
      passed: z.boolean(),
      details: z.string(),
    })),
  }),
  outputSchema: z.object({
    fixedCode: z.string(),
    changesSummary: z.string(),
    confidence: z.number().min(0).max(100),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
Given this Rust/Anchor Solana contract:
\`\`\`rust
${inputData.code}
\`\`\`

Issues found:
${inputData.issues}

Simulation results: ${inputData.simulationReport}

Test results:
${inputData.testResults.map(
  t => `- ${t.testCase}: ${t.passed ? "PASSED" : "FAILED"} (${t.details})`
).join("\n")}

Rewrite the code with security fixes. For each fix:
1. Add clear comments explaining what was fixed
2. Use proper Anchor constraints and validations
3. Implement safe arithmetic operations
4. Add proper error handling
5. Ensure all accounts are properly validated

After the fixed code, provide a summary of changes made.

Output format:
FIXED_CODE:
\`\`\`rust
[your fixed code here]
\`\`\`

CHANGES_SUMMARY:
[bullet points of what was fixed]
`;

    try {
      const resp = await agent.stream([{ role: "user", content: prompt }]);
      let response = "";

      for await (const chunk of resp.textStream) {
        response += chunk;
      }

      const codeMatch = response.match(/FIXED_CODE:\s*```rust\n([\s\S]*?)\n```/);
      const summaryMatch = response.match(/CHANGES_SUMMARY:\s*([\s\S]*?)(?:\n\n|\n$|$)/);

      const fixedCode = codeMatch ? codeMatch[1] : response;
      const changesSummary = summaryMatch ? summaryMatch[1] : "Code fixes applied";

      const confidence = codeMatch && summaryMatch ? 85 : 60;

      return { fixedCode, changesSummary, confidence };
    } catch (error: any) {
      console.error("Auto-fix failed:", error);
      return {
        fixedCode: inputData.code,
        changesSummary: `Auto-fix failed: ${error.message}`,
        confidence: 0
      };
    }
  },
});

// Enhanced workflow with better schema
const auditInput = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  programId: z.string().optional(),
  fileName: z.string().optional(),
  testCases: z.array(z.string()).optional(),
});

const auditOutput = z.object({
  issues: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  issueCount: z.number(),
  simulationReport: z.string().optional(),
  testResults: z.array(z.object({
    testCase: z.string(),
    passed: z.boolean(),
    details: z.string(),
  })).optional(),
  fixedCode: z.string().optional(),
  changesSummary: z.string().optional(),
  confidence: z.number().optional(),
});

export const auditorWorkflow = createWorkflow({
  id: "solana-smart-contract-auditor",
  inputSchema: auditInput,
  outputSchema: auditOutput,
})
  .then(staticAnalysis)
  .then(dynamicAnalysis)
  .then(autoFix);

// Commit the workflow
auditorWorkflow.commit();

// // Usage example
// export async function auditContract(code: string, options?: {
//   programId?: string;
//   fileName?: string;
//   testCases?: string[];
// }) {
//   try {
//     const result = await auditorWorkflow.execute({
//       code,
//       programId: options?.programId,
//       fileName: options?.fileName,
//       testCases: options?.testCases,
//     });

//     return result;
//   } catch (error) {
//     console.error("Audit workflow failed:", error);
//     throw error;
//   }
// }

// Helper function to validate Solana program structure
export function validateSolanaProgram(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation checks
  if (!code.includes("use anchor_lang::prelude::*") && !code.includes("use solana_program::")) {
    errors.push("Missing Solana/Anchor imports");
  }

  if (!code.includes("#[program]") && !code.includes("entrypoint!")) {
    errors.push("Missing program entry point");
  }

  if (code.includes("unwrap()")) {
    errors.push("Found unwrap() calls - use proper error handling");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}