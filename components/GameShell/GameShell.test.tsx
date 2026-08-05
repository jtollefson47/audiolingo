import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GameShell } from "./GameShell";
import { exampleGame } from "@/games/example";
import { gameEventBus } from "@/lib/gameEventBus";

describe("GameShell", () => {
  afterEach(() => {
    cleanup();
    gameEventBus.clear();
  });

  it("renders the game name and difficulty", () => {
    render(<GameShell game={exampleGame} difficulty="beginner" />);
    // "Example Game" and difficulty appear in both the shell toolbar and the game body.
    expect(screen.getAllByText(/Example Game/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Difficulty: beginner/i).length).toBeGreaterThan(0);
  });

  it("emits a start event on mount", () => {
    const listener = vi.fn();
    gameEventBus.on("start", listener);

    render(<GameShell game={exampleGame} difficulty="intermediate" />);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0];
    expect(event.type).toBe("start");
    expect(event.gameSlug).toBe("example");
  });

  it("renders the game component and answers update the UI", async () => {
    render(<GameShell game={exampleGame} difficulty="advanced" />);

    const correctButton = screen.getByRole("button", { name: /correct/i });
    correctButton.click();

    expect(await screen.findByText(/1\/1 correct \(100%\)/i)).toBeInTheDocument();
  });
});