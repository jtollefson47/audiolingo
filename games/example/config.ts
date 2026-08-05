import type { GameConfig } from "@/types/game";

export const exampleConfig: GameConfig = {
  slug: "example",
  name: "Example Game",
  description: "A minimal example game demonstrating the plugin system.",
  difficulties: ["beginner", "intermediate", "advanced"],
  category: "demo",
  icon: "🎮",
};