import type { Metadata } from "next";
import Container from "@/components/Container";
import ExploreSearch from "./Components/ExploreSearch";
import { LETTERS } from "@/libs/mockLetters";

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

export default function Page() {
  return (
    <Container>
      <ExploreSearch letters={LETTERS} />
    </Container>
  );
}
