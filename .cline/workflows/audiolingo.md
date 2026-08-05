# Audiolingo Workspace Workflow

**TRIGGER TOKENS:** `build module`, `build game`, `audio audit`, `run tests`, `scaffold`, `workspace workflow`

## Purpose
Project-specific workflow for Audiolingo — a Duolingo-meets-Sound-Gym audio engineering and music education app. Enforces `.clinerules` conventions via a parallel subagent pipeline with role-specialized skills and scoped folder access.

## Orchestration Model

The orchestrator (parent agent) decomposes the task, spawns relevant subagents in parallel via `new_task`, then runs the QA subagent after all workers complete.

**Execution order:**

```
User Request
   |
   v
Orchestrator (reads .clinerules, decomposes task)
   |
   |-- runs in parallel:
   |    1. Frontend Subagent
   |    2. Game + Module Subagent
   |    3. Audio Subagent
   |    4. Backend + Platform Subagent
   |
   v
QA Subagent (validates all outputs sequentially, last)
   |
   v
Orchestrator Summary
```

## Role-Specialized Subagent Roster

---

### 1. Frontend Subagent

**Workload:** High — every feature needs UI (components, pages, layouts, accessibility).

**Skills:**
- React 18+, TypeScript, Tailwind CSS
- Next.js App Router (pages, layouts, client/server components)
- Accessibility: WCAG, ARIA roles, keyboard-only navigation
- Responsive layout with rem/em units (no fixed px dimensions)
- shadcn/ui + Radix primitives (slider, dialog, tabs, progress, badge, tooltip)
- Test query scoping: use `within(toolbar)` / `within(section)` when shell and game render the same text

**Folder access (exclusive):** `/app`, `/components`

**Responsibilities:**
- Build and style UI components following atomic design
- Implement keyboard navigation + ARIA fallbacks
- Create Next.js pages and layouts
- Flag any `px`-based fixed dimensions in component styles

---

### 2. Game + Module Subagent

**Workload:** High — core product; many games and modules with shared patterns (merging reduces handoff overhead and keeps parallelism high).

**Skills:**
- TypeScript, state machines, pure functional scoring
- Difficulty scaling (beginner / intermediate / advanced)
- Educational content structure, quiz/challenge logic
- Progress and score persistence via platform abstraction (never raw localStorage)

**Folder access (exclusive):** `/games`, `/modules`

**Responsibilities:**
- Scaffold `config.ts`, `scoring.ts`, `state.ts` (or `use<Name>State.ts`) per game/module
- Implement all 3 difficulty levels via config object
- Own game rules, lesson data, and progression logic
- Persist via `/lib/platform.ts` abstraction

---

### 3. Audio Subagent

**Workload:** High — unique to Audiolingo; complex and touches everything. Internally split into two parallel tracks when both are needed.

**Skills:**
- Web Audio API, Tone.js, AudioWorklet
- Audio signal processing, ear training concepts
- Node lifecycle management (connect/disconnect, leak prevention)
- `AudioContext.suspend()`/`resume()` battery management
- Browser autoplay policy compliance

**Folder access (exclusive):** `/lib` (audio files only: `audio*.ts`, `worklets/`), `/hooks` (audio hooks only: `useAudio*.ts`)

**Parallel tracks:**
- **Audio Core** — helpers (`/lib/audio*.ts`) + custom hooks (`/hooks/useAudio*.ts`)
- **Audio Worklet** — latency-sensitive processors (`/lib/worklets/`)

**Responsibilities:**
- Build audio helpers and custom hooks
- Implement proper node connect/disconnect lifecycle (no memory leaks)
- Use suspend/resume for battery on mobile
- Build AudioWorklet processors for latency-sensitive games
- Never autoplay without a user gesture

---

### 4. Backend + Platform Subagent

**Workload:** Low-Medium combined — thin API layer + infrequent platform audits. Merged so this agent is never idle and integrates cleanly with the pipeline.

**Skills:**
- Node.js, TypeScript REST API design
- Next.js API routes, data validation, error responses
- Platform abstraction patterns (localStorage web / AsyncStorage native)
- React Native / Expo shim patterns
- iOS readiness auditing

**Folder access (exclusive):** `/app/api`, `/lib/platform.ts`, `/types`

**Responsibilities:**
- Build/maintain Next.js API routes with typed contracts
- Handle validation and error responses
- Maintain `/lib/platform.ts` abstraction layer
- Audit for browser-only APIs without a shim; flag `px` in layout
- Ensure persistence swaps cleanly (localStorage → AsyncStorage)

---

### 5. QA / Test Subagent

**Workload:** High — every new file needs tests; runs last in every pipeline against complete outputs.

**Skills:**
- Vitest, React Testing Library, TypeScript
- Test design (unit, component, state machine)
- Coverage analysis (scoring logic, audio helpers, state machines)
- Web Audio API mocking discipline (only mock for UI-only tests)

**Folder access (exclusive):** `**/__tests__/`, `**/*.test.ts`, `**/*.spec.ts`

**Responsibilities:**
- Write unit tests for all scoring, audio helper, and state machine files
- Write component tests only where layout stability is critical
- Never mock Web Audio API for non-UI tests
- Run `npx vitest run` (plus `--coverage` if requested)
- Fix failing tests by fixing the implementation — never invert assertions

---

## Orchestrator Instructions

### 1. Context Ingestion
- ALWAYS re-read `.clinerules` at the start of every task session.
- Confirm project structure: `/app`, `/components`, `/modules`, `/games`, `/lib`, `/hooks`, `/types`.

### 2. Decomposition
- Break the request into independent subtasks, one per subagent.
- Assign each only to its scoped folders and skills.
- Skip agents not relevant to the request (e.g., no audio changes → no Audio subagent).
- Batch config-only files (package.json, tsconfig, tailwind, next.config, vitest.config) into a single parallel step — do not write them sequentially.
- Before writing framework config files, verify the installed framework version supports the chosen format (e.g., Next.js 14 does NOT support `next.config.ts` — use `.mjs`/`.js`).

### 3. Parallel Spawn
- Spawn all relevant subagents via `new_task` in parallel.
- Each subagent task MUST include:
  - Exact file paths within its folder scope
  - Its role-specific skills as context
  - A clear, verifiable deliverable

### 4. QA Gate
- After all workers complete, spawn the QA subagent to validate every deliverable.
- QA runs `npx vitest run` — all tests must pass before completion.
- QA ALSO runs `npx tsc --noEmit` — type errors must be zero before declaring the build ready (catches issues like iterator spread on Map, missing module types).
- QA also verifies: audio cleanup, accessibility fallbacks, persistence via platform abstraction, rem/em (no px) in layout.

### 5. Completion
- Summarize what was built, which subagents ran, and their deliverables.
- List any files flagged by QA.
- Provide the command to run tests or demo the result.

## Subagent Delegation Summary

| # | Subagent | Skills | Folder Scope | Runs |
|---|---|---|---|---|
| 1 | Frontend | React, Tailwind, Next.js, ARIA, rem/em | `/app`, `/components` | Parallel |
| 2 | Game + Module | TS, state machines, scoring, difficulty | `/games`, `/modules` | Parallel |
| 3 | Audio | Web Audio, Tone.js, AudioWorklet | `/lib/audio*`, `/hooks/useAudio*` | Parallel |
| 4 | Backend + Platform | Node, API routes, platform abstraction | `/app/api`, `/lib/platform.ts`, `/types` | Parallel |
| 5 | QA/Tests | Vitest, RTL, coverage | `**/__tests__/`, test files | Sequential (last) |
