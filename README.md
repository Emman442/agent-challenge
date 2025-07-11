# Solana Smart Contract Auditor Workflow

This project provides a modular, automated auditing workflow for **Solana smart contracts** (written in Rust and Anchor). It performs static analysis, dynamic simulations, and auto-fix suggestions on Solana programs to detect vulnerabilities and enhance security.

---

## 🚨 Problem

Auditing Solana smart contracts is **complex, time-consuming, and error-prone**. Developers must:
- Manually review code for missing signer checks, overflow risks, and PDA validation.
- Simulate attacks to verify protections against exploits like reentrancy.
- Fix issues manually, often overlooking subtle vulnerabilities.

This creates significant risks for Solana developers and protocols.

---

## ✅ Solution

This workflow automates the entire auditing process:

### 1. **Static Analysis**  
Performs in-depth static audits, identifying:
- Missing signer checks (`is_signer`)
- PDA seed verification  
- Integer overflows & underflows  
- Reentrancy issues  
- Account & rent checks  
- Access control flaws

### 2. **Dynamic Analysis**  
Generates **attack simulations** based on static analysis:
- Exploits vulnerabilities
- Tests edge cases
- Simulates reentrancy and overflow attacks

### 3. **Auto-Fix**  
Automatically generates secure, improved versions of the contract code:
- Comments on each fix  
- Uses Anchor constraints for validations  
- Replaces unsafe operations  
- Adds proper error handling

---

## How It Works

1. **Input**: Solana smart contract code (Rust/Anchor).
2. Workflow runs:
   - Static Analysis
   - Dynamic Simulation
   - Auto-Fix Suggestions
3. Returns:
   - List of vulnerabilities + severity
   - Simulation reports
   - Fixed code with a summary and confidence score.

---

