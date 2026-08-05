import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllGames, getGame } from "@/lib/gameRegistry";
import GamePage from "@/components/GamePage";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllGames().map((game) => ({ slug: game.config.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const game = getGame(params.slug);
  if (!game) return { title: "Game not found" };
  return {
    title: game.config.name,
    description: game.config.description,
  };
}

export default function GameRoute({ params }: Props) {
  const game = getGame(params.slug);
  if (!game) notFound();

  return <GamePage slug={params.slug} />;
}