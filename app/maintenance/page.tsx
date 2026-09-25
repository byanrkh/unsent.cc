export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        className="text-3xl italic text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        We'll be back soon
      </p>
      <p className="mt-3 max-w-sm text-[var(--color-muted)]">
        <span className="underline decoration-dotted underline-offset-4 cursor-pointer">
          unsent.cc
        </span>{" "}
        is taking a little time to make some changes. Your letters are safe
      </p>
    </main>
  );
}
