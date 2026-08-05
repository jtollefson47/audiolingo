import Link from "next/link";
import { getAllGames } from "@/lib/gameRegistry";

export const metadata = {
  title: "Games",
  description: "Browse all Audiolingo games.",
};

export default function GamesIndex() {
  const games = getAllGames();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Games</h1>
      {games.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No games registered yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {games.map((game) => (
            <li key={game.config.slug}>
              <Link
                href={`/games/${game.config.slug}`}
                className="block rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-foreground"
              >
                <div className="text-lg font-medium">
                  {game.config.icon ? `${game.config.icon} ` : ""}
                  {game.config.name}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{game.config.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}