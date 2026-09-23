import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-6 pt-8 pb-8 sm:px-10 sm:pt-10 sm:pb-9">
      <div className="mx-auto flex max-w-175 items-center justify-between text-sm">
        <Link
          href="/"
          className="tracking-wide text-lg text-[#171717] transition-opacity hover:opacity-55"
        >
          unsent.cc
        </Link>
        <ul className="flex items-center gap-5 sm:gap-8">
          <li className="text-[#171717] transition-opacity hover:opacity-55">
            <Link href="/explore">Explore</Link>
          </li>
          <li className="text-[#171717] transition-opacity hover:opacity-55">
            <Link href="/terms">Terms</Link>
          </li>
          <li className="transition-opacity hover:opacity-55">
            <Link href="/submit">Submit</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
