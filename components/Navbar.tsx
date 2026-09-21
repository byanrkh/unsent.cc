import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-6 pt-8 pb-8 sm:px-10 sm:pt-10 sm:pb-9">
      <div className="mx-auto flex max-w-[700px] items-center justify-between text-sm sm:text-base">
        <div className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/explore"
            className="text-[#171717] transition-opacity hover:opacity-55"
          >
            Explore
          </Link>
          <Link
            href="/terms"
            className="text-[#171717] transition-opacity hover:opacity-55"
          >
            Terms
          </Link>
        </div>
        <Link
          href="/login"
          className="tracking-wide text-[#171717] transition-opacity hover:opacity-55"
        >
          [ Login ]
        </Link>
      </div>
    </nav>
  );
}
