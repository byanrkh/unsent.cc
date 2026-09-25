export const MAX_MESSAGE_LENGTH = 100;

export const morphTransition = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function getCounterColor(length: number) {
  if (length >= MAX_MESSAGE_LENGTH) return "text-[var(--color-danger)]";
  if (length > 80) return "text-[var(--foreground)]";
  return "text-[var(--color-muted)]";
}