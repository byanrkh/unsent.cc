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
          message="Burger Gendeng Burger Gendeng"
          date="Written 3 days ago"
        />
      </div>
    </Container>
  );
}
