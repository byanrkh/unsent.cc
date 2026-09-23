"use client";

import { useState } from "react";
import ExploreCard from "./ExploreCard";

type Letter = {
  to: string;
  message: string;
  date?: string;
};

type ExploreSearchProps = {
  letters: Letter[];
};

export default function ExploreSearch({ letters }: ExploreSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLetters = normalizedQuery
    ? letters.filter(
        (letter) =>
          letter.to.toLowerCase().includes(normalizedQuery) ||
          letter.message.toLowerCase().includes(normalizedQuery),
      )
    : letters;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-80 text-base italic text-[#3a3a3a] font-medium">
          Messages that were never sent —
          <br />
          read gently.
        </p>

        <div className="flex h-9 w-full shrink-0 items-center self-end rounded-full border border-[#171717]/10 bg-[#fbfaf8] sm:w-64 sm:self-auto">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#9c9c9c]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block -translate-y-px"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name or word…"
            className="h-full w-full min-w-0 bg-transparent pr-3.5 text-[13px] leading-none text-[#171717] outline-none placeholder:text-[#9c9c9c] placeholder:leading-none sm:text-sm"
          />
        </div>
      </div>

      {filteredLetters.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          {filteredLetters.map((letter, index) => (
            <ExploreCard
              key={`${letter.to}-${index}`}
              to={letter.to}
              message={letter.message}
              date={letter.date}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm italic text-[#9c9c9c]">
          No unsent letters found for "{query.trim()}".
        </p>
      )}
    </>
  );
}
