import type { Metadata } from "next";
import Container from "@/components/Container";
import ExploreSearch from "./Components/ExploreSearch";
import { fetchLetters } from "@/libs/letters";

// Always hit Supabase fresh instead of serving a stale cached page —
// new letters should show up on /explore right away.
export const dynamic = "force-dynamic";

const PAGE_TITLE = "Explore";
const PAGE_DESCRIPTION =
  "Read unsent letters left by strangers — quiet, anonymous messages that were never sent to the people they were meant for.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/explore",
  },
  twitter: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

type PageProps = {
  searchParams: Promise<{ letter?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const letters = await fetchLetters();
  const resolvedSearchParams = await searchParams;

  // ?letter=<id> — dipasang lewat tombol "Copy link" di ShareModal.
  const sharedId = Array.isArray(resolvedSearchParams.letter)
    ? resolvedSearchParams.letter[0]
    : resolvedSearchParams.letter;

  return (
    <Container>
      <ExploreSearch letters={letters} sharedId={sharedId} />
    </Container>
  );
}
