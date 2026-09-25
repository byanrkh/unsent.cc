import type { Metadata } from "next";
import Container from "@/components/Container";
import Link from "next/link";

const PAGE_TITLE = "About Unsent";
const PAGE_DESCRIPTION =
  "Learn what Unsent is and why it exists — a quiet place for the messages you never sent.";
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/terms",
  },
  twitter: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

function renderListItem(item: string) {
  const separatorIndex = item.indexOf(": ");
  if (separatorIndex === -1) return item;

  const lead = item.slice(0, separatorIndex);
  const rest = item.slice(separatorIndex + 2);

  return (
    <>
      <strong className="font-medium text-[var(--foreground)]">{lead}:</strong>{" "}
      {rest}
    </>
  );
}

export default function Page() {
  return (
    <Container>
      <article className="pb-16 sm:pb-24">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
            {PAGE_TITLE}
          </h1>
        </header>

        <p className="text-[15px] leading-relaxed text-[var(--color-fg-secondary)] sm:text-base">
          Some things are easier to write than to say.
          <br />
          <br />
          Unsent is a place to write the messages you never sent.
          <br /> Maybe it's something you wanted to say years ago.
          <br /> Maybe it's a message you typed but never had the courage to
          send.
          <br />
          Maybe it's something you just need to get out of your head.
          <br />
          <br />
          You don't have to send it. You don't have to explain it. You don't
          even have to know what happens next.
          <br />
          <br /> Just write.
        </p>

        <section className="mt-10 sm:mt-14">
          <h2 className="text-lg font-medium text-[var(--foreground)] sm:text-xl">
            Why Unsent?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-fg-secondary)] sm:text-base">
            Not every message needs a recipient. Sometimes, writing the words is
            enough. Unsent exists for those messages the ones that stayed in
            your drafts, lived in your notes, or remained only in your head.
            Write them down. Leave them here. It doesn't have to be sent to be
            said.
          </p>
        </section>

        <section className="mt-10 sm:mt-14">
          <h2 className="text-lg font-medium text-[var(--foreground)] sm:text-xl">
            Contact
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-fg-secondary)] sm:text-base">
            If you have questions regarding these terms or need to report
            abusive content, please contact us at{" "}
            <Link
              href="mailto:hello@unsent.cc"
              className="text-[var(--foreground)] underline decoration-[var(--color-muted)]/50 underline-offset-4 transition-opacity hover:opacity-55"
            >
              hello@unsent.cc
            </Link>
            .
          </p>
        </section>
      </article>
    </Container>
  );
}
