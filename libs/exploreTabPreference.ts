import type { ExploreTab } from "@/app/(root)/explore/Components/ExploreTabs";

const TAB_KEY = "unsent-explore-tab";

export function readStoredTab(): ExploreTab | null {
  try {
    const raw = localStorage.getItem(TAB_KEY);
    return raw === "for-you" || raw === "latest" ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredTab(tab: ExploreTab) {
  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch {
    // ignore write errors (e.g. private browsing / storage disabled)
  }
}