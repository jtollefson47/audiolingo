import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Audiolingo</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Learn audio engineering and music through games.
      </p>

      <div className="mt-8">
        <Link
          href="/games"
          className="inline-flex items-center rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          Browse Games
        </Link>
      </div>
    </main>
  );
}