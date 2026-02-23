---
sidebar_position: 2
title: "Day 1: Cursor AI + CodeRabbit"
---

# Day 1: Cursor AI + CodeRabbit

**Duration:** ~5 hours | **Status:** ✅ Complete

## Day objective

By the end of this day you must have:
- Cursor AI installed, configured with Claude Sonnet 4.6 and working as your primary editor
- CodeRabbit active in the Tenmás repository and your first PR automatically reviewed
- A clear workflow: when to use `Cmd+K`, when to use `Cmd+L`, when to use Composer

---

## Part 1: Cursor AI

### Installation

1. Download Cursor from [cursor.sh](https://cursor.sh)
2. Install and open the application
3. On first launch: **Sign in with GitHub** (use your Tenmás team account)

```bash
# Verify it's installed correctly
cursor --version
```

### Model configuration

In Cursor, go to **Settings → Models** and configure:

| Setting | Value |
|---------|-------|
| Primary model | `claude-sonnet-4-6` |
| Fast model | `claude-haiku-4-5-20251001` |

:::tip
No API key needed. Cursor includes direct access to Claude Sonnet 4.6 and other models as part of the subscription. Just sign in with your team account and the models are ready to use.
:::

### Import VS Code settings

If you were using VS Code before:

1. `Cmd+Shift+P` → type `Import VS Code Settings`
2. Cursor automatically imports extensions, keybindings and snippets
3. Verify your critical extensions are installed in the Extensions tab

:::warning
Some VS Code extensions don't have a Cursor version yet. If one doesn't appear, search for it manually in the Cursor marketplace.
:::

---

### The 3 Cursor modes — when to use each one

This is where the team gets confused most at the beginning. Cursor has 3 ways to interact with AI, and each has its use case:

#### Mode 1: Inline Edit — `Cmd+K`
**Use it when:** you want to modify code you already have selected.

```
Select code → Cmd+K → write instruction → AI edits in place
```

Examples of when to use it:
- Refactoring a specific function
- Adding error handling to an existing block
- Converting code to a different pattern (e.g.: callbacks → async/await)
- Adding TypeScript types to untyped functions

#### Mode 2: Chat — `Cmd+L`
**Use it when:** you need to ask questions, request explanations or generate new code with file context.

```
Cmd+L → chat opens with current file context → ask questions or request code
```

Examples of when to use it:
- "What does this class do and what are its responsibilities?"
- "Is there any security issue in this endpoint?"
- "Generate a function that consumes this interface that already exists"
- Debugging: "Why could this code fail with undefined inputs?"

#### Mode 3: Composer — `Cmd+I`
**Use it when:** the change affects multiple files or you need to create complete features.

```
Cmd+I → Composer opens → describe the full feature → AI proposes changes across files
```

Examples of when to use it:
- "Create a new REST endpoint with its controller, service and tests"
- "Refactor this function and update all the places that use it"
- "Add JWT authentication to these 3 endpoints"

:::info Practical rule
If the change is in **1 place** → `Cmd+K`. If you need **context or have a question** → `Cmd+L`. If the change touches **multiple files** → `Cmd+I`.
:::

---

### How to write good prompts in Cursor

The quality of AI output depends directly on the quality of the prompt. Here are the patterns that work at Tenmás:

#### Good prompt structure

```
[CONTEXT] + [WHAT YOU WANT] + [CONSTRAINTS/HOW]
```

#### Real examples — from bad to good

**Case 1: Adding validation**

❌ Bad:
```
validate the inputs
```

✅ Good:
```
This function receives email and password from a login form.
Add validation: email must be a valid format, password minimum 8 characters,
both required. If validation fails, throw a ValidationError with a specific
message per field. Don't use external libraries.
```

---

**Case 2: Creating a service**

❌ Bad:
```
create a user service
```

✅ Good:
```
Create a UserService in TypeScript that uses the UserRepository that already exists in
./repositories/user.repository.ts. The service must have: getUserById(id: string),
updateUser(id: string, data: Partial<User>), and deleteUser(id: string).
All methods must be async and throw NotFoundError if the user doesn't exist.
Follow the same pattern as AuthService in ./services/auth.service.ts.
```

---

**Case 3: Debugging**

❌ Bad:
```
why isn't this working?
```

✅ Good:
```
This endpoint returns 500 when userId is undefined. The error in logs is:
"Cannot read properties of undefined (reading 'id')". Analyze the code and tell me
exactly where it fails and how to fix it without breaking existing tests.
```

---

**Case 4: Refactoring**

❌ Bad:
```
improve this code
```

✅ Good:
```
Refactor this function so that:
1. It uses the early return pattern instead of nested if-else
2. It extracts validation logic to a separate function called validateOrderData
3. It maintains exactly the same external behavior (don't change the signature)
4. It adds JSDoc comments to the new functions
```

---

### Anti-patterns: what NOT to do with Cursor

:::danger Common team mistakes
**1. Accepting without reading**
Never press Tab on long suggestions without reading what the code does. AI can introduce subtle bugs or use patterns that don't match Tenmás's standards.

**2. Vague prompts for critical code**
For critical business code (payments, authentication, user data), be extremely specific in your prompt. The AI doesn't know your business rules.

**3. Using Cursor on already-tested code**
If you have working code with tests, don't refactor it with AI just for the sake of it. The risk isn't worth it.

**4. Not giving codebase context**
If you're asking for something that depends on other files, first add them to the chat context with `@filename` before asking.
:::

### How to add context with @

In Cursor's chat, you can reference files, folders and docs:

| Syntax | What it does |
|--------|-------------|
| `@filename.ts` | Adds a specific file to context |
| `@src/services/` | Adds an entire folder |
| `@docs` | Adds the project documentation |
| `@git` | Adds the current git diff |
| `@web` | Allows Cursor to search the internet |

**Usage example:**
```
@user.service.ts @user.repository.ts

Based on the user service and repository that already exist,
create a UserController with the same endpoints but that validates
permissions before executing each operation.
```

---

## Part 2: CodeRabbit

### What does CodeRabbit do exactly?

CodeRabbit is an AI code reviewer that runs automatically on every PR. This is what it produces:

**1. PR Summary** (always, at the start)
```
This PR adds user authentication with JWT tokens. Changes include:
- New AuthService with login/logout methods
- JWT middleware for protected routes
- Updated user model with password hashing
- 12 new tests covering auth flows

Potential concerns: password hashing uses bcrypt with cost factor 10,
consider increasing to 12 for production.
```

**2. Per-file review** — inline comments just like any human reviewer.

**3. Applicable suggestions** — code you can apply with one click:

```diff
- const user = await User.findById(id)
+ const user = await User.findById(id).lean()
// Suggestion: Use .lean() for read-only operations to improve performance
```

**4. Walkthrough** — natural language explanation of what changed and why.

### Connect to the Tenmás repository

1. Go to [coderabbit.ai](https://coderabbit.ai)
2. **Sign in with GitHub** → authorize access to the Tenmás organization
3. In the dashboard, select the repository
4. CodeRabbit is now active on every new PR

### Tenmás standard configuration

Create `.coderabbit.yaml` in the **root of each Tenmás repository**:

```yaml
# .coderabbit.yaml — Tenmás standard configuration
# Don't modify this without talking to the Tech Lead
language: "en-US"

reviews:
  profile: "assertive"
  request_changes_workflow: false
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false
  path_filters:
    - "!**/*.lock"
    - "!**/node_modules/**"
    - "!**/*.min.js"
    - "!**/dist/**"
    - "!**/*.generated.ts"

chat:
  auto_reply: true
```

:::info Why `assertive` and not `chill`?
`assertive` produces more detailed reviews and flags more issues. At Tenmás we want a demanding reviewer. If at the start the volume of comments overwhelms you, you can temporarily switch to `chill`, but the team standard is `assertive`.
:::

### Complete workflow with CodeRabbit

```
Developer                    GitHub                   CodeRabbit
    │                          │                          │
    ├──── git push ──────────► │                          │
    ├──── Opens PR ──────────► │                          │
    │                          ├──── Trigger ───────────► │
    │                          │                    (analyzes code)
    │                          │ ◄── Review (~2 min) ─── │
    │ ◄── Notification ─────── │                          │
    │                          │                          │
    ├── Reads summary/comments  │                          │
    ├── Applies suggestions ──► │                          │
    ├── Replies to CodeRabbit ► │ ──── Re-review ────────► │
    │                          │                          │
    ├── Requests human review ► │                          │
    ├── Human approves ───────► │                          │
    └──── Merge ──────────────► │                          │
```

### How to interact with CodeRabbit in a PR

CodeRabbit has a chat inside the PR. You can ask it things directly:

```
@coderabbitai Why did you flag this code as a security issue?
I understand the variable is exposed, but in this case it's intentional
because it's a public endpoint.
```

CodeRabbit responds, updates its analysis and can mark the comment as resolved.

**Useful commands in the chat:**
- `@coderabbitai review` — forces a new review
- `@coderabbitai summary` — regenerates the PR summary
- `@coderabbitai ignore this file` — ignores a file in the current review
- `@coderabbitai resolve` — marks all comments as resolved

### What to do when CodeRabbit flags a false positive

Not all CodeRabbit comments are real problems. When you find a false positive:

1. **Reply on the comment** explaining why it's intentional
2. **Add a comment in the code** to leave context for future reviewers
3. **If it happens often** for the same pattern, add it to `path_filters` or create a rule in `.coderabbit.yaml`

```yaml
# Example: give specific instructions for a path
reviews:
  path_instructions:
    - path: "src/scripts/**"
      instructions: "These are one-off migration scripts. Focus only on data safety issues, not code style."
```

---

## Day 1 Exercises

### Exercise 1: The 3 Cursor modes (30 min)

Open a real Tenmás project and practice each mode:

**Part A — `Cmd+K` (Inline Edit)**
1. Find a function without TypeScript types
2. Select it completely
3. `Cmd+K` → `"Add strict TypeScript types to all parameters and the return type"`
4. Accept if correct, modify if something is missing

**Part B — `Cmd+L` (Chat)**
1. Open the most complex file in the project
2. `Cmd+L` → `"Analyze this entire class. Does it have SOLID issues? Are there mixed responsibilities?"`
3. Ask at least 2 follow-up questions

**Part C — `Cmd+I` (Composer)**
1. `Cmd+I` → describe this task:
   ```
   Create a utilities file called date.utils.ts in src/utils/ with functions
   for: formatting a date to DD/MM/YYYY string, calculating day difference between
   two dates, and checking if a date is a weekend. Include unit tests
   in date.utils.test.ts with at least 3 cases per function.
   ```
2. Review all files Composer proposes to create
3. Accept the changes and verify the tests run

### Exercise 2: Prompt library (20 min)

Create the file `docs/useful-prompts.md` in the project with at least 3 prompts you discovered today that work well. This file will be shared with the whole team.

Suggested format:
```markdown
## Prompt name

**When to use it:** ...
**Prompt:**
\```
...
\```
**Expected result:** ...
```

### Exercise 3: First PR with CodeRabbit (30 min)

1. Create a branch: `git checkout -b feat/test-coderabbit-[your-name]`
2. Add the date utilities from Exercise 1 (or any real change)
3. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add date utility functions with unit tests"
   ```
4. Open a PR with a clear title and description explaining what you did
5. Wait for CodeRabbit's review
6. Read the full walkthrough
7. Apply at least 1 CodeRabbit suggestion
8. Reply to at least 1 CodeRabbit comment (even if it's to say it's a false positive)

---

## Troubleshooting

**Cursor doesn't show inline suggestions**
→ Verify that `Editor: Inline Suggest` is enabled in Settings
→ Make sure the model is selected in Settings → Models

**Cursor chat responds in a different language**
→ Add at the start of the chat: `"Always respond in English"` or configure the system prompt in Settings → AI → Rules for AI

**CodeRabbit didn't appear on the PR after 5 minutes**
→ Verify the CodeRabbit GitHub App has permissions on the repo
→ Check the Webhooks section in GitHub repository Settings
→ Contact the Tech Lead to review the organization configuration

**CodeRabbit gives too many comments on generated files**
→ Add them to `path_filters` in `.coderabbit.yaml`:
```yaml
path_filters:
  - "!**/*.generated.ts"
  - "!**/migrations/**"
```

---

## Day 1 Checklist

When done with the day, verify:

- [ ] Cursor AI installed and opening projects without errors
- [ ] Model configured: Claude Sonnet 4.6
- [ ] Tried all 3 modes: `Cmd+K`, `Cmd+L`, `Cmd+I`
- [ ] Completed Exercise 1 (A, B and C)
- [ ] Created `docs/useful-prompts.md` with my first prompts
- [ ] CodeRabbit connected to the Tenmás repository
- [ ] `.coderabbit.yaml` created and pushed to the repo
- [ ] First PR reviewed by CodeRabbit
- [ ] Applied at least 1 CodeRabbit suggestion
- [ ] Replied to at least 1 CodeRabbit comment

---

## Resources

- [Cursor Docs — Getting Started](https://docs.cursor.sh/get-started/migrate-from-vscode)
- [Cursor Docs — AI Features](https://docs.cursor.sh/ai-features)
- [Cursor — Keyboard shortcuts](https://docs.cursor.sh/kbd)
- [CodeRabbit Docs](https://docs.coderabbit.ai)
- [CodeRabbit — Configuration Reference](https://docs.coderabbit.ai/getting-started/configure-coderabbit)
- [Anthropic — Claude for coding](https://docs.anthropic.com/en/docs/use-cases/coding)
- [Prompt engineering guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
