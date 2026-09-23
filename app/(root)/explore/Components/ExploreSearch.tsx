"use client";

import { useEffect, useRef, useState } from "react";
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
  const [expanded, setExpanded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasQuery = query.trim().length > 0;

  function openSearch() {
    setExpanded(true);
    // Wait a frame so the width transition has started before focusing —
    // focusing immediately can yank the page on mobile mid-animation.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function collapseIfEmpty() {
    if (!hasQuery) setExpanded(false);
  }

  // Klik di luar box search → tutup lagi (kalau kosong).
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        collapseIfEmpty();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQuery]);

  // Escape → clear & tutup.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQuery("");
        setExpanded(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        <div
          ref={wrapperRef}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={collapseIfEmpty}
          className={`flex h-9 shrink-0 items-center self-end overflow-hidden rounded-full border border-[#171717]/10 bg-[#fbfaf8] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:self-auto ${
            expanded ? "w-56 sm:w-64" : "w-9"
          }`}
        >
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search unsent letters"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[#9c9c9c] transition-colors duration-200 hover:text-[#171717]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setExpanded(true)}
            onBlur={collapseIfEmpty}
            placeholder="Search a name or word…"
            className={`w-full min-w-0 bg-transparent pr-3.5 text-[13px] text-[#171717] outline-none placeholder:text-[#9c9c9c] transition-opacity duration-200 sm:text-sm ${
              expanded ? "opacity-100 delay-100" : "opacity-0"
            }`}
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
          No unsent letters found for “{query.trim()}”.
        </p>
      )}
    </>
  );
}
