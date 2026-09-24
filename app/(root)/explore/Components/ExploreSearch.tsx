"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExploreCard from "./ExploreCard";
import ExploreTabs, { type ExploreTab } from "./ExploreTabs";
import type { Letter } from "@/libs/mockLetters";
import {
  formatRelativeDate,
  getForYouLetters,
  sortByLatest,
} from "@/libs/exploreFilters";
import { readStoredTab, writeStoredTab } from "@/libs/exploreTabPreference";

type ExploreSearchProps = {
  letters: Letter[];
};

export default function ExploreSearch({ letters }: ExploreSearchProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("for-you");
  // Bumped every time a "For You" refresh completes so the random mix
  // reshuffles instead of staying frozen for the whole session.
  const [forYouSeed, setForYouSeed] = useState(0);
  // Pressing "For You" always reads as a refresh: the spinner shows while
  // this is true, and the tab/mix only update once it settles.
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  // getForYouLetters() uses Math.random(), which would produce a different
  // order on the server than on the client's first render and trigger a
  // hydration mismatch. So the very first render (SSR + initial client
  // paint) always uses the deterministic "latest" order; the randomized mix
  // only kicks in once we know we're safely past hydration. The same effect
  // also restores whichever tab the user had open last, since reading
  // localStorage before mount would cause that same kind of mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const storedTab = readStoredTab();
    if (storedTab) setActiveTab(storedTab);
    setMounted(true);
  }, []);

  const tabbedLetters = useMemo(() => {
    if (activeTab === "latest" || !mounted) return sortByLatest(letters);
    return getForYouLetters(letters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, letters, forYouSeed, mounted]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLetters = normalizedQuery
    ? tabbedLetters.filter(
        (letter) =>
          letter.to.toLowerCase().includes(normalizedQuery) ||
          letter.message.toLowerCase().includes(normalizedQuery),
      )
    : tabbedLetters;

  const REFRESH_DELAY_MS = 500;

  function handleTabChange(tab: ExploreTab) {
    if (tab === "latest") {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      setRefreshing(false);
      setActiveTab("latest");
      writeStoredTab("latest");
      return;
    }

    // "for-you" — switching in from another tab is a plain, instant
    // shuffle. Only re-pressing it while it's already active counts as an
    // explicit refresh.
    if (activeTab !== "for-you") {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      setRefreshing(false);
      setActiveTab("for-you");
      writeStoredTab("for-you");
      return;
    }

    setRefreshing(true);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      setForYouSeed((seed) => seed + 1);
      setRefreshing(false);
      refreshTimeoutRef.current = null;
    }, REFRESH_DELAY_MS);
  }

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

      <div
        className={`mb-6 transition-opacity duration-200 sm:mb-8 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <ExploreTabs
          active={activeTab}
          onChange={handleTabChange}
          refreshing={refreshing}
        />
      </div>

      {filteredLetters.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredLetters.map((letter) => (
              <motion.div
                key={letter.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <ExploreCard
                  id={letter.id}
                  to={letter.to}
                  message={letter.message}
                  date={formatRelativeDate(letter.createdAt)}
                  feltCount={letter.feltCount}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="py-10 text-center text-sm italic text-[#9c9c9c]">
          No unsent letters found for "{query.trim()}".
        </p>
      )}
    </>
  );
}
