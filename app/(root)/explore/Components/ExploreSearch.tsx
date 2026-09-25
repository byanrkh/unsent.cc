"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExploreCard from "./ExploreCard";
import ExploreTabs, { type ExploreTab } from "./ExploreTabs";
import SharedLetterModal from "./SharedLetterModal";
import type { Letter } from "@/libs/letters";
import {
  formatRelativeDate,
  getForYouLetters,
  sortByLatest,
} from "@/libs/exploreFilters";
import { readStoredTab, writeStoredTab } from "@/libs/exploreTabPreference";

type ExploreSearchProps = {
  letters: Letter[];
  sharedId?: string;
};

export default function ExploreSearch({
  letters,
  sharedId,
}: ExploreSearchProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("for-you");
  // Bumped every time a "For You" refresh completes so the random mix
  // reshuffles instead of staying frozen for the whole session.
  const [forYouSeed, setForYouSeed] = useState(0);
  // Pressing "For You" always reads as a refresh: the spinner shows while
  // this is true, and the tab/mix only update once it settles.
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kalau URL bawa ?letter=<id> (dari tombol "Copy link" di ShareModal),
  // surat itu dicari dari data awal — lepas dari tab/search apa pun yang
  // lagi aktif, sama kayak buka post dari link di Instagram.
  const sharedLetter = sharedId
    ? letters.find((letter) => letter.id === sharedId)
    : undefined;

  // Modal preview kebuka otomatis begitu ada surat yang di-share ditemukan —
  // tapi mulai dari `false` di sini biar konsisten sama render server, baru
  // di-set true di effect mounted (lihat di bawah) tergantung TIPE
  // navigasinya. Ditutup -> `layoutId` yang sama di card di bawah bikin
  // Framer Motion nge-morph modal ini balik ke posisi & ukuran card-nya,
  // bukan cuma fade biasa.
  const [previewOpen, setPreviewOpen] = useState(false);

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

    if (sharedLetter) {
      // Modal-nya mau selalu muncul tiap kali link share ini DIBUKA (klik
      // link, ketik URL, tab baru — mau berapa kali pun), tapi TIDAK
      // muncul lagi kalau orangnya cuma nge-refresh halaman yang sama.
      // Navigation Timing API bisa bedain dua itu lewat `entry.type`:
      // "reload" vs "navigate"/"back_forward". Kalau API-nya gak
      // available buat alasan apa pun, default-nya tetep nampilin modal
      // (lebih aman daripada diem-diem gak pernah muncul).
      let isReload = false;
      try {
        const [navEntry] = performance.getEntriesByType(
          "navigation",
        ) as PerformanceNavigationTiming[];
        isReload = navEntry?.type === "reload";
      } catch {
        isReload = false;
      }
      if (!isReload) setPreviewOpen(true);
    }

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabbedLetters = useMemo(() => {
    if (activeTab === "latest" || !mounted) return sortByLatest(letters);
    return getForYouLetters(letters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, letters, forYouSeed, mounted]);

  const normalizedQuery = query.trim().toLowerCase();
  const searchedLetters = normalizedQuery
    ? tabbedLetters.filter(
        (letter) =>
          letter.to.toLowerCase().includes(normalizedQuery) ||
          letter.message.toLowerCase().includes(normalizedQuery),
      )
    : tabbedLetters;

  // Surat yang di-share selalu dipin di paling atas feed — lepas dari tab
  // atau search yang lagi aktif.
  const filteredLetters = sharedLetter
    ? [
        sharedLetter,
        ...searchedLetters.filter((letter) => letter.id !== sharedLetter.id),
      ]
    : searchedLetters;

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
        <p className="max-w-80 text-base italic text-[#3a3a3a] dark:text-[#686868] font-medium">
          Messages that were never sent —
          <br />
          read gently.
        </p>

        <div className="flex h-9 w-full shrink-0 items-center self-end rounded-full border border-[var(--foreground)]/10 bg-[var(--color-surface)] sm:w-64 sm:self-auto">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--color-muted)]">
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
            className="h-full w-full min-w-0 bg-transparent pr-3.5 text-[13px] leading-none text-[var(--foreground)] outline-none placeholder:text-[var(--color-muted)] placeholder:leading-none sm:text-sm"
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
            {filteredLetters.map((letter) => {
              const isShared = letter.id === sharedLetter?.id;
              return (
                <motion.div
                  key={letter.id}
                  // `layoutId` cuma dipasang di card yang lagi di-preview.
                  // Ini yang dibaca Framer Motion buat nyamain boks ini
                  // sama boks di SharedLetterModal, sehingga pas modalnya
                  // ditutup dia "menyusut" balik ke sini alih-alih cuma
                  // ilang.
                  layoutId={
                    isShared ? `letter-preview-${letter.id}` : undefined
                  }
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
                    // Ring pulse-nya baru nyala setelah modal preview
                    // ditutup, biar keliatan nyambung sama animasi morph
                    // "turun"-nya, bukan nyala bareng pas modal masih nutup
                    // layar.
                    highlighted={isShared && !previewOpen}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <p className="py-10 text-center text-sm italic text-[var(--color-muted)]">
          {normalizedQuery
            ? `No unsent letters found for "${query.trim()}".`
            : "No messages yet — be the first to leave one."}
        </p>
      )}

      {sharedLetter && (
        <SharedLetterModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          letter={sharedLetter}
          date={formatRelativeDate(sharedLetter.createdAt)}
        />
      )}
    </>
  );
}
