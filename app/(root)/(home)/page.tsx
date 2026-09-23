import UnsentForm from "./Components/UnsentForm";

const THINGS_LEFT_UNSAID = 150;

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 items-center px-6 sm:px-10">
        <div className="mx-auto w-full max-w-175 pb-[6vh]">
          <p className="mb-10 max-w-57.5 text-base italic text-[#3a3a3a] sm:mb-14 font-medium animate-page-in">
            Some things are easier to write
            <br />
            than to say.
          </p>

          <UnsentForm />
        </div>
      </main>

      <footer className="px-6 pb-8 pt-5 text-center text-xs text-[#3a3a3a] sm:px-10 sm:pb-9 sm:text-right sm:text-[15px] animate-page-in">
        <span className="tabular-nums">
          {THINGS_LEFT_UNSAID.toLocaleString("en-US")}
        </span>{" "}
        things left unsaid.
      </footer>
    </div>
  );
}
