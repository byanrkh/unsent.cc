import type { Metadata } from "next";
import Container from "@/components/Container";
import ExploreSearch from "./Components/ExploreSearch";

const LETTERS = [
  {
    to: "Jasmine",
    message:
      "I still remember the way you laughed at your own jokes before anyone else did. I never told you that was my favorite sound. I hope wherever you are, someone else gets to hear it too.",
    date: "Written 3 days ago",
  },
];

export default function Page() {
  return (
    <Container>
      <ExploreSearch letters={LETTERS} />
    </Container>
  );
}
