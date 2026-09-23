export const MAX_MESSAGE_LENGTH = 100;

export const morphTransition = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function getCounterColor(length: number) {
  if (length >= MAX_MESSAGE_LENGTH) return "text-[#9a3b32]";
  if (length > 80) return "text-[#171717]";
  return "text-[#9c9c9c]";
}