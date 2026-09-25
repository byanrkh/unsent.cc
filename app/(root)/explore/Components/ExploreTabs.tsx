"use client";

import { motion } from "framer-motion";

const TABS = [
  { key: "for-you", label: "For You" },
  { key: "latest", label: "Latest" },
] as const;

export type ExploreTab = (typeof TABS)[number]["key"];

type ExploreTabsProps = {
  active: ExploreTab;
  onChange: (tab: ExploreTab) => void;
  refreshing?: boolean;
};

export default function ExploreTabs({
  active,
  onChange,
  refreshing = false,
}: ExploreTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Explore filter"
      className="flex items-center gap-5 sm:gap-6"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const showSpinner = tab.key === "for-you" && refreshing;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-busy={showSpinner || undefined}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 pb-1.5 text-[13px] tracking-wide transition-opacity duration-200 sm:text-sm ${
              isActive
                ? "text-[var(--foreground)]"
                : "text-[var(--color-muted)] hover:opacity-70"
            }`}
          >
            {tab.label}

            {showSpinner && (
              <motion.svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                className="shrink-0 text-[var(--color-muted)]"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              </motion.svg>
            )}

            {isActive && (
              <motion.span
                layoutId="explore-tab-underline"
                className="absolute inset-x-0 -bottom-px h-px bg-[var(--foreground)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
