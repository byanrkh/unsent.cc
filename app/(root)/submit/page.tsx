import type { Metadata } from "next";
import SubmitForm from "./Components/SubmitForm";

const PAGE_TITLE = "Submit";
const PAGE_DESCRIPTION =
  "Add a few final details and leave your unsent message on unsent.cc — anonymous, unfiltered, and read gently by strangers.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/submit",
  },
  twitter: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 items-center px-6 sm:px-10">
        <div className="mx-auto w-full max-w-175 pb-[6vh]">
          <p className="mb-10 max-w-57.5 text-base italic text-[#3a3a3a] sm:mb-14 font-medium animate-page-in">
            Almost there —
            <br />
            add a few details.
          </p>

          <SubmitForm />
        </div>
      </main>
    </div>
  );
}
