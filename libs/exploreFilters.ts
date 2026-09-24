import type { Letter } from "./mockLetters";

// Ratio of the "For You" feed reserved for the newest letters; the rest is
// filled with a random shuffle of the remaining pool.
const NEWEST_SHARE = 0.3;

export function formatRelativeDate(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Written just now";

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `Written ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `Written ${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `Written ${days} day${days > 1 ? "s" : ""} ago`;
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Pure descending sort by createdAt — newest first. */
export function sortByLatest(letters: Letter[]): Letter[] {
  return [...letters].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Builds the "For You" feed: ~30% of the list is the most recent letters,
 * the remaining ~70% is a random draw from the rest of the pool, then the
 * combined set is shuffled once more so the newer picks aren't visibly
 * clumped together.
 */
export function getForYouLetters(letters: Letter[]): Letter[] {
  const total = letters.length;
  if (total === 0) return [];

  const newestCount = Math.min(total, Math.max(1, Math.round(total * NEWEST_SHARE)));
  const newestPool = sortByLatest(letters).slice(0, newestCount);
  const newestIds = new Set(newestPool.map((letter) => letter.id));

  const remainingPool = letters.filter((letter) => !newestIds.has(letter.id));
  const randomPool = shuffle(remainingPool);

  return shuffle([...newestPool, ...randomPool]);
}