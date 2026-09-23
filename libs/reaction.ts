const FELT_KEY = "unsent-felt-letters";

function readFeltIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FELT_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeFeltIds(ids: Set<string>) {
  try {
    localStorage.setItem(FELT_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore write errors (e.g. private browsing / storage disabled)
  }
}

export function hasFelt(id: string): boolean {
  return readFeltIds().has(id);
}

// Toggles the felt state for this id and returns the new state.
export function toggleFelt(id: string): boolean {
  const ids = readFeltIds();
  const next = !ids.has(id);
  if (next) {
    ids.add(id);
  } else {
    ids.delete(id);
  }
  writeFeltIds(ids);
  return next;
}