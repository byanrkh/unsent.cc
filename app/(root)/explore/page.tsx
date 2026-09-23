import Container from "@/components/Container";
import ExploreCard from "./Components/ExploreCard";

export default function Page() {
  return (
    <Container>
      <p className="mb-8 max-w-80 text-base italic text-[#3a3a3a] sm:mb-12 font-medium">
        Messages that were never sent —
        <br />
        read gently.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:gap-6">
        <ExploreCard
          to="Kasep"
          message="I still remember the way you laughed at your own jokes before anyone else did. I never told you that was my favorite sound. I hope wherever you are, someone else gets to hear it too."
          date="Written 3 days ago"
        />
      </div>
    </Container>
  );
}
