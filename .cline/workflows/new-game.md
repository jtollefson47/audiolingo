# New Game Workflow

**TRIGGER TOKENS:** `new game`, `create game`, `scaffold game`

## Purpose
Scaffolds a complete new game plugin for Audiolingo in one shot. Orchestrates the specialized subagents in parallel to produce a fully working, tested game registered in the plugin registry.

## Orchestration

```
User: "Build game: <name> (type: <category>)"
     |
     v
Orchestrator
     |-- runs in parallel:
     |    1. Game + Module subagent (scaffolds games/<name>/ core files)
     |    2. Frontend subagent (creates UI for the game inside the shell)
     |    3. Audio subagent (only if game uses audio)
     |
     v
QA subagent (validates all outputs, runs vitest)
     |
     v
Orchestrator registers game + reports result
```

## Inputs Required

| Input | Description | Example |
|---|---|---|
| Game name | Display name | "Frequency Trainer" |
| Slug | URL + registry key (kebab-case) | "frequency-trainer" |
| Category | Lobby grouping | "ear-training" |
| Uses audio? | Whether the game needs audio | yes/no |

## Step-by-Step

### Step 1 — Decompose
- Determine which subagents are needed (Audio subagent only if game uses audio).
- Define the exact file paths for each subagent's deliverable.

### Step 2 — Delegate in Parallel (via new_task)

**Game + Module Subagent** creates in `/games/<slug>/`:
- `config.ts` — GameConfig with all 3 difficulties
- `scoring.ts` — pure scoring function
- `use<Name>Store.ts` — Zustand store factory
- `<Name>Game.tsx` — game component (receives `difficulty`, `emit`, `onReset`)
- `index.ts` — exports the GamePlugin
- `__tests__/scoring.test.ts` — scoring unit tests

**Frontend Subagent** (if custom UI needed beyond the game component):
- Any shared components in `/components/<name>/`
- Ensures accessibility + rem/em layout

**Audio Subagent** (if game uses audio):
- Audio helpers in `/lib/audio*` or `/lib/worklets/`
- Audio hooks in `/hooks/useAudio*`

### Step 3 — QA Gate
- QA subagent runs `npx vitest run` — all tests must pass.
- QA verifies the game renders in GameShell, emits events, supports keyboard nav.

### Step 4 — Register
- Orchestrator adds `registerGame(<name>Game)` to `lib/gameRegistry.ts`.
- Confirm route `/games/<slug>` works via `npm run dev`.

### Step 5 — Report
- Summarize files created, tests passing, and how to play the game.

## Checklist for Every New Game

- [ ] `config.ts` with slug, name, 3 difficulties, category
- [ ] `scoring.ts` pure + unit tested
- [ ] Zustand store factory (no module-level state)
- [ ] Component receives `GameProps` and never renders page chrome
- [ ] All audio via Web Audio/Tone.js with proper cleanup
- [ ] Keyboard-only navigable
- [ ] Fluid layout (rem/em, works on phone + desktop)
- [ ] Registered in `gameRegistry.ts`