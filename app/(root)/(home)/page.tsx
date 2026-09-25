import Link from "next/link";
import { fetchLetters } from "@/libs/letters";
import { shuffle } from "@/libs/exploreFilters";
import UnsentForm from "./Components/UnsentForm";
import ChatMarquee from "./Components/ChatMarquee";

const MARQUEE_PREVIEW_COUNT = 10;

export default async function Page() {
  const letters = await fetchLetters();
  const THINGS_LEFT_UNSAID = letters.length;

  const marqueeLetters = shuffle(letters)
    .slice(0, MARQUEE_PREVIEW_COUNT)
    .map(({ id, to, message }) => ({ id, to, message }));

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col px-6 sm:px-10">
        {/* Quote + form — selalu center di ruang yang tersisa, gak
            kegeser sama tinggi marquee/CTA di bawahnya. */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mx-auto w-full max-w-175">
            <p className="mb-10 max-w-57.5 text-base italic text-[#3a3a3a] sm:mb-14 font-medium animate-page-in">
              Some things are easier to write
              <br />
              than to say.
            </p>

            <UnsentForm />
          </div>
        </div>

        {/* Marquee + CTA — ngikutin lebar & posisi horizontal input,
            nempel di bawah tanpa ganggu centering di atas. */}
        <div className="mx-auto w-full max-w-175 pb-[6vh]">
          <div className="mt-10 sm:mt-14 animate-page-in">
            <ChatMarquee letters={marqueeLetters} />
          </div>

          {marqueeLetters.length > 0 && (
            <div className="mt-5 flex justify-center sm:mt-6 animate-page-in">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-1.5 text-[13px] italic text-[#9c9c9c] transition-colors duration-200 hover:text-[#171717] sm:text-sm"
              >
                Read more unsent letters
                <span className="inline-block not-italic transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 pb-8 pt-5 text-center text-xs text-[#3a3a3a] sm:px-10 sm:pb-9 sm:text-right sm:text-[15px] animate-page-in">
        <span className="tabular-nums">
          {THINGS_LEFT_UNSAID.toLocaleString("en-US")}
        </span>{" "}
        things left unsaid.
      </footer>
    </div>
  );
}
