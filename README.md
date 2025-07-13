# 🛡️ Solana Smart Contract Auditor

> **An automated auditing agent for Solana smart contracts**, powered by the [Mastra framework](https://github.com/nosana-ci/mastra) and deployed on the decentralized GPU network [Nosana](https://nosana.io).

---

## ⚠️ The Problem

Auditing Solana smart contracts is:
- 🕵️ Manual and error-prone
- ⌛ Time-consuming
- 🧠 Requires expert knowledge of Anchor, signer validation, and PDA derivation

Missed vulnerabilities can lead to **major financial exploits**. Yet developers often lack tools to detect them early.

---

## ✅ The Solution

The **Solana Smart Contract Auditor** automates the full auditing workflow:

### 🔍 Static Analysis
Flags common security issues in Anchor/Rust code:
- ❌ Missing `is_signer` validations
- 🔐 Insecure PDA derivation
- 🔁 Reentrancy issues
- 📏 Arithmetic overflows/underflows
- 🔒 Access control flaws
- 🧾 Rent exemption and account checks

### 🧪 Attack Simulation
Dynamically tests your code using:
- Edge-case fuzzing
- Malicious reentrancy loops
- Unsafe PDA inputs
- Overflow simulations

### 🤖 Auto-Fix Suggestions
Automatically generates secure code fixes:
- Adds Anchor constraints
- Enforces signer/PDA checks
- Replaces unsafe math ops
- Annotates changes with comments

---

## ⚙️ How It Works

1. You input your Solana program code (Rust/Anchor)
2. The agent runs:
   - `StaticAnalysisAgent`
   - `AttackSimulationAgent`
   - `AutoFixAgent`
3. It returns:
   - A list of vulnerabilities with severity
   - Simulated attack results
   - Auto-fixed code suggestions with explanations

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourname/solana-auditor.git
cd solana-auditor
```
You can test the agent using the following prompt which contains alot of Solana program(smart contract) vunerabilities:

```bash
Please audit the following Solana smart contract for vulnerabilities, inefficiencies, and best practice issues:


use anchor_lang::prelude::*;

#[program]
pub mod config_manager {
    use super::*;
    
    pub fn update_config(ctx: Context<UpdateConfig>, new_value: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // No initialization check
        config.value = new_value;
        config.last_updated = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
    
    pub fn get_config_value(ctx: Context<GetConfig>) -> Result<u64> {
        let config = &ctx.accounts.config;
        
        // Direct access without validation
        Ok(config.value)
    }
}

#[account]
pub struct Config {
    pub value: u64,
    pub last_updated: i64,
    pub admin: Pubkey,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub config: Account<'info, Config>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetConfig<'info> {
    pub config: Account<'info, Config>,
}

```


[Proof of deployment](https://4sb6su725eyqdyvzbjt249i3nu2qihrbhnxcp4jydxkh.node.k8s.prd.nos.ci/agents/agent/chat)

[Demo Video](https://x.com/VersatileBeingX/status/1944419258911309876)

[Twitter Post](https://x.com/VersatileBeingX/status/1944419258911309876)
