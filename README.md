# Audiolingo

Duolingo-meets-Sound-Gym audio engineering and music education app. Learn compressors, EQs, preamps, mixers, effects, and audio ear training through games.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **State:** Zustand (per-game scoped stores)
- **Audio:** Web Audio API / Tone.js (planned)
- **Testing:** Vitest + React Testing Library

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

```bash
npm test          # run all tests
npm run test:coverage
npm run lint
```

## Project Structure

```
/app                  Next.js App Router pages and layouts
/components           Reusable UI components (atomic design)
/games/<name>/        Self-contained game plugins
/lib                  Shared utilities (registry, event bus, platform)
/hooks                Custom React hooks
/modules              Learning modules (equipment, instruments, ear training)
/types                Global TypeScript type definitions
```

## Game Plugin System

Games are self-contained plugins rendered inside a consistent `GameShell` — analogous to an embedded YouTube player. The shell provides chrome, sizing behavior, and an event bridge while knowing nothing about the game inside.

### Anatomy of a Game Plugin

Every game in `/games/<name>/` must export a `GamePlugin`:

| File | Purpose |
|---|---|
| `config.ts` | Metadata: slug, name, description, difficulties |
| `scoring.ts` | Pure scoring function (`(ScoringInput) => ScoringResult`) |
| `use<Name>Store.ts` | Zustand store factory, scoped per game instance |
| `<Name>Game.tsx` | The React component rendered inside the shell |
| `index.ts` | Assembles and exports the `GamePlugin` object |

### Registering a Game

1. Create `/games/<name>/` with the files above
2. Import and register it in `lib/gameRegistry.ts`:

```ts
import { myGame } from "@/games/my-game";
registerGame(myGame);
```

The game is immediately available at `/games/<slug>` and embeddable anywhere via:

```tsx
<GameShell game={myGame} difficulty="beginner" />
```

### Game Events

Games emit events through the shell via a typed event bus (`lib/gameEventBus.ts`), keeping games decoupled from the host page.

```ts
gameEventBus.on("score", (event) => console.log(event.payload));
```

Event types: `start`, `score`, `progress`, `complete`, `pause`, `resume`.

### Requirements for Every Game

- Any game component is rendered inside the `GameShell` and receives `difficulty`, `emit`, and `onReset` props
- All three difficulty levels: `beginner`, `intermediate`, `advanced`
- Scoring function must be pure and unit-tested
- Layout must be fluid (rem/em) — works on phone and desktop
- All state must live in the per-instance Zustand store (no module-level mutable state)

## Conventions

- All audio via Web Audio API / Tone.js — no Flash
- Audio nodes properly connected/disconnected (no memory leaks)
- No autoplay without a user gesture
- Platform-specific code goes through `/lib/platform.ts`
- Progress and scores persisted via the platform abstraction

## Environment Variables

See `.env.local.example`. Copy to `.env.local` and fill in values.