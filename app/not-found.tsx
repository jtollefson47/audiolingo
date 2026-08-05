import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Game not found</h1>
      <p className="mt-2 text-muted-foreground">The game you requested does not exist.</p>
      <Link
        href="/games"
        className="mt-6 inline-flex items-center rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
      >
        Browse Games
      </Link>
    </main>
  );
}