import { supabase } from "./supabase";

export type Letter = {
  id: string;
  to: string;
  message: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  feltCount: number;
};

type LetterRow = {
  id: string;
  to_name: string;
  message: string;
  felt_count: number;
  created_at: string;
};

function mapRow(row: LetterRow): Letter {
  return {
    id: row.id,
    to: row.to_name,
    message: row.message,
    createdAt: row.created_at,
    feltCount: row.felt_count,
  };
}

/** Fetches every letter, newest first. Used to hydrate /explore. */
export async function fetchLetters(): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, to_name, message, felt_count, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch letters:", error.message);
    return [];
  }

  return (data as LetterRow[]).map(mapRow);
}

/** Inserts a new letter. Throws on failure so the caller can show an error. */
export async function submitLetter(input: {
  to: string;
  message: string;
}): Promise<Letter> {
  const to = input.to.trim() || "Someone";
  const message = input.message.trim();

  const { data, error } = await supabase
    .from("letters")
    .insert({ to_name: to, message })
    .select("id, to_name, message, felt_count, created_at")
    .single();

  if (error) throw error;

  return mapRow(data as LetterRow);
}

/**
 * Atomically increments/decrements a letter's felt_count via the
 * `increment_felt_count` RPC (so nobody can set an arbitrary value
 * directly from the client). Returns the new count, or null on failure.
 */
export async function updateFeltCount(
  id: string,
  delta: 1 | -1,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("increment_felt_count", {
    letter_id: id,
    delta,
  });

  if (error) {
    console.error("Failed to update felt count:", error.message);
    return null;
  }

  return data as number;
}