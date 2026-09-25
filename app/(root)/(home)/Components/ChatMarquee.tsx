import { Mono } from "@/libs/Font";

export type MarqueeLetter = {
  id: string;
  to: string;
  message: string;
};

type ChatMarqueeProps = {
  letters: MarqueeLetter[];
};

// Marquee-nya ngeloop mulus dengan cara duplikasi list-nya sekali, terus
// geser -50% (persis setengah dari total lebar row yang udah didobelin).
// Durasi animasi ngikutin jumlah item biar makin banyak chat, makin lama
// (kecepatan geser per-item tetep konsisten).
const SECONDS_PER_ITEM = 4;

export default function ChatMarquee({ letters }: ChatMarqueeProps) {
  if (letters.length === 0) return null;

  const items = [...letters, ...letters];
  const duration = `${letters.length * SECONDS_PER_ITEM}s`;

  return (
    <div
      className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-hidden="true"
    >
      <div
        className="animate-marquee flex w-max gap-3 sm:gap-4 group-hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {items.map((letter, index) => (
          <div
            key={`${letter.id}-${index}`}
            className="flex max-w-64 shrink-0 items-center gap-2 rounded-full border border-[#171717]/8 bg-[#fbfaf8] px-4 py-2 sm:max-w-80 sm:px-4.5 sm:py-2.5"
          >
            <span className="shrink-0 text-[10px] tracking-wide text-[#9c9c9c] sm:text-[11px]">
              To {letter.to}
            </span>
            <span
              className={`${Mono.className} truncate text-[12px] font-light text-[#171717] sm:text-[13px]`}
            >
              {letter.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
