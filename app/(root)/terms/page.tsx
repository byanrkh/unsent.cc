import type { Metadata } from "next";
import Container from "@/components/Container";
import Link from "next/link";

const PAGE_TITLE = "Terms of Service";
const PAGE_DESCRIPTION =
  "Terms of Service for unsent.cc — how anonymous submissions, content moderation, data storage, and your rights as a user work on the platform.";

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

type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
};

const LAST_UPDATED = "Last updated: September 2026";

const INTRO =
  'Welcome to unsent.cc ("we", "us", or "our"). By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.';

const SECTIONS: Section[] = [
  {
    id: "core-concept",
    title: "1. The Core Concept",
    paragraphs: [
      "unsent.cc is an anonymous digital archive for messages, thoughts, and sentiments that were meant to be written but never sent to their intended recipients. unsent.cc is not a social media platform, a direct messaging app, or a personal diary. It is a shared, quiet space for reflection and expression.",
    ],
  },
  {
    id: "anonymity",
    title: "2. Complete Anonymity and Content Submission",
    list: [
      "100% Anonymous by Default: All messages submitted to unsent.cc are strictly anonymous. You cannot set, customize, or attach a sender name or identity to public submissions.",
      "No Personal Information: You are strictly prohibited from including personal identifiable information (such as real full names, phone numbers, addresses, social media handles, or private financial details) about yourself or anyone else inside the text of your message.",
      "Your Responsibility: You are solely responsible for the words you submit.",
    ],
  },
  {
    id: "prohibited",
    title: "3. Prohibited Content and Conduct",
    paragraphs: [
      "unsent.cc is built as a space for safe expression, but anonymity does not grant permission for abuse. You agree not to submit content or engage in activities that include:",
    ],
    list: [
      "Doxxing: Revealing private personal information of any individual without consent.",
      "Hate Speech & Harassment: Content that promotes discrimination, violence, bullying, or target-directed hate against any individual or group.",
      "Self-Harm & Harmful Conduct: Explicit encouragement or instructions regarding self-harm or suicide.",
      "Spam & Automated Submissions: Submitting mass automated messages, commercial promotions, or links to malicious sites.",
    ],
  },
  {
    id: "moderation",
    title: "4. Moderation & Removal",
    paragraphs: ["We reserve the right, but are not obligated, to:"],
    list: [
      "Monitor, review, and filter public submissions using automated or manual moderation systems.",
      "Remove, reject, or unpublish any message that violates these terms or is deemed inappropriate at any time without prior notice.",
      "Apply rate limiting and security measures to prevent spam and platform abuse.",
    ],
  },
  {
    id: "data-storage",
    title: "5. Data Storage and Public Archiving",
    list: [
      "No User Accounts: unsent.cc does not require or support registration, passwords, or traditional user accounts.",
      "Public Database Storage: When you submit a message, the content of your message is permanently stored in our central database to be archived, displayed publicly on the platform, or delivered to other users anonymously.",
      'No Submission History: unsent.cc does not keep any record, on your device or otherwise, linking a submitted message back to you. Once a message is left, it cannot be edited, retrieved, or deleted by you — there is no personal archive or "my submissions" view.',
      "Local Storage for Preferences Only: Your browser's local storage is used only for small on-device conveniences, such as remembering which Explore tab you last viewed and which messages you've marked as \"felt.\" Clearing your local storage simply resets these preferences and has no effect on any message you've submitted.",
    ],
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property & License",
    list: [
      "You retain ownership of the original text you write.",
      "By submitting a message publicly on unsent.cc, you grant us a non-exclusive, worldwide, royalty-free license to display, archive, format, and share the message (including dynamic image previews/share cards) within the scope of operating and promoting the unsent.cc platform.",
    ],
  },
  {
    id: "disclaimer",
    title: "7. Disclaimer of Warranties",
    paragraphs: [
      'unsent.cc is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted access, continuous availability, or that stored messages will never be lost. unsent.cc is an artistic digital archive and is not a professional counseling or crisis intervention service.',
    ],
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    paragraphs: [
      "We may update these Terms of Service from time to time. Continued use of the website following any changes constitutes your acceptance of the new terms.",
    ],
  },
];

function renderListItem(item: string) {
  const separatorIndex = item.indexOf(": ");
  if (separatorIndex === -1) return item;

  const lead = item.slice(0, separatorIndex);
  const rest = item.slice(separatorIndex + 2);

  return (
    <>
      <strong className="font-medium text-[#171717]">{lead}:</strong> {rest}
    </>
  );
}

export default function Page() {
  return (
    <Container>
      <article className="pb-16 sm:pb-24">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-2xl font-medium tracking-tight text-[#171717] sm:text-3xl">
            {PAGE_TITLE}
          </h1>
          <p className="mt-2 text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
            {LAST_UPDATED}
          </p>
        </header>

        <p className="text-[15px] leading-relaxed text-[#3a3a3a] sm:text-base">
          {INTRO}
        </p>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 sm:mt-14">
            <h2 className="text-lg font-medium text-[#171717] sm:text-xl">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-[15px] leading-relaxed text-[#3a3a3a] sm:text-base"
              >
                {paragraph}
              </p>
            ))}

            {section.list && (
              <ul className="mt-4 space-y-3">
                {section.list.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-[15px] leading-relaxed text-[#3a3a3a] sm:text-base"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#9c9c9c]"
                    />
                    <span>{renderListItem(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-10 sm:mt-14">
          <h2 className="text-lg font-medium text-[#171717] sm:text-xl">
            Contact
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#3a3a3a] sm:text-base">
            If you have questions regarding these terms or need to report
            abusive content, please contact us at{" "}
            <Link
              href="mailto:just@unsent.cc"
              className="text-[#171717] underline decoration-[#9c9c9c]/50 underline-offset-4 transition-opacity hover:opacity-55"
            >
              just@unsent.cc
            </Link>
            .
          </p>
        </section>
      </article>
    </Container>
  );
}
