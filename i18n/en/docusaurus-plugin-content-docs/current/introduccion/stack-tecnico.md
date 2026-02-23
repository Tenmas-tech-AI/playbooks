---
sidebar_position: 3
title: Technical Stack
---

# AI-Native Technical Stack

This is Tenmás's official AI toolset. It's not a list of suggestions — it's the team standard. Each tool has a specific role and was chosen after evaluating alternatives.

## Stack map

```
┌──────────────────────────────────────────────────────────┐
│                      DEVELOPMENT                         │
│   Cursor AI (editor)       CodeRabbit (code review)     │
├──────────────────────────────────────────────────────────┤
│                   OBSERVABILITY                          │
│   PromptLayer (LLM tracking)     Grafana (metrics)      │
├──────────────────────────────────────────────────────────┤
│                   AUTOMATION                             │
│    Make.com (workflows)     Playwright (E2E testing)    │
├──────────────────────────────────────────────────────────┤
│                    AI BACKEND                            │
│           LangChain (pipelines and agents)              │
├──────────────────────────────────────────────────────────┤
│                   DOCUMENTATION                          │
│         Docusaurus (this site — in ES and EN)           │
└──────────────────────────────────────────────────────────┘
```

## Tools in detail

### Editor & AI Coding

| Tool | Role at Tenmás | Setup |
|------|----------------|-------|
| **Cursor AI** | Primary editor with embedded AI. Replaces VS Code for the whole team. Uses Claude Sonnet 4.6 by default. | Day 1 |
| **CodeRabbit** | Automatic review of every PR. Detects bugs, code smells and security issues before the human reviewer. | Day 1 |

### AI Observability

| Tool | Role at Tenmás | Setup |
|------|----------------|-------|
| **PromptLayer** | Records every LLM call: sent prompt, received response, cost and latency. Allows auditing and optimizing AI usage in production. | Day 2 |
| **Grafana** | Dashboards with real team productivity metrics and AI model performance. | Day 5 |

### Automation & Testing

| Tool | Role at Tenmás | Setup |
|------|----------------|-------|
| **Make.com** | Automates repetitive workflows: notifications, data sync, triggers between services. | Day 3 |
| **Playwright** | Mandatory E2E testing for critical features. Runs in CI before every merge. | Day 3 |

### AI Pipelines

| Tool | Role at Tenmás | Setup |
|------|----------------|-------|
| **LangChain** | Framework for building LLM applications: reasoning chains, autonomous agents and RAG (Retrieval-Augmented Generation). | Day 4 |

### Documentation

| Tool | Role at Tenmás | Setup |
|------|----------------|-------|
| **Docusaurus** | This site. Versioned technical documentation, in Spanish and English, with integrated search and automatic deploy. | Days 6–7 |

---

## AI Models we use

Tenmás uses Anthropic's **Claude 4** family as the standard. Don't use older versions in new projects.

| Model | API ID | When to use it | Relative cost |
|-------|--------|---------------|---------------|
| **Claude Sonnet 4.6** | `claude-sonnet-4-6` | Daily coding, code analysis, code review, complex tasks | ⚡ Balanced |
| **Claude Haiku 4.5** | `claude-haiku-4-5-20251001` | Classification, short responses, high-volume pipelines | 💚 Cheapest |
| **Claude Opus 4.6** | `claude-opus-4-6` | Architecture, complex reasoning, critical decisions | 🔴 Most expensive |
| **GPT-4o** | — | Backup when Claude is unavailable | — |
| **Llama 3 (local via Ollama)** | — | Data that can't leave the company | 💚 Free |

### When to use each model — concrete examples

**Use Claude Sonnet 4.6 for:**
- Writing code in Cursor (default)
- Generating unit tests
- Assisted code review
- Answering questions about the codebase
- Documentation tasks

**Use Claude Haiku 4.5 for:**
- Classifying ticket/issue categories
- Generating short PR summaries in automated pipelines
- Chatbot responses where latency < quality
- Pipelines processing hundreds of requests per hour

**Use Claude Opus 4.6 for:**
- System architecture design
- Deep security analysis of critical code
- High-impact refactoring decisions
- When Sonnet doesn't produce the expected output after 2–3 attempts

:::tip Always start with Sonnet
If you're not sure which to use, use Sonnet 4.6. Only scale up to Opus if you need more reasoning capacity, and only scale down to Haiku if cost or latency is a real problem.
:::

---

## Stack rules

:::warning Non-negotiable rules
1. **Cursor AI is the standard editor** — not VS Code, Zed or Neovim for team work during the program
2. **No PR is merged without CodeRabbit** — it's part of the CI flow, not optional
3. **PromptLayer tracks every LLM call in production** — if you use an LLM in prod, it goes with tracking
4. **Playwright is mandatory** for any critical business feature
5. **Don't use Claude 3.x in new projects** — the Claude 4 family is available and superior
:::

---

## Stack FAQ

**Can I use GitHub Copilot alongside Cursor?**
Not during the 2 weeks of the program. We want the team to deeply learn Cursor before mixing tools. After the program, talk to the Tech Lead.

**Can I use ChatGPT for quick tasks?**
For personal learning tasks, yes. For code going into the repository, no — use Cursor with Claude Sonnet 4.6 so codebase context is available and the prompt is logged.

**What happens if Cursor goes down?**
Use VS Code temporarily. If the outage lasts more than 30 minutes, report to the Tech Lead. Don't use other AI alternatives without approval.

**Do I have to pay for Cursor Pro out of my own pocket?**
No. Tenmás covers the licenses. Request access from the Tech Lead in the team channel.

---

## Selection principles

Why these tools and not others? We evaluated each one with these criteria:

1. **Integration** — Does it work well with the rest of the stack?
2. **Observability** — Can we see what it does and measure its impact?
3. **Cost** — Does the ROI justify the price?
4. **Learning curve** — Can a new engineer use it in one day?
5. **Support and community** — Does it have active documentation and long-term backing?
