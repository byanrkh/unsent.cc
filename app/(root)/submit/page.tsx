import SubmitForm from "./Components/SubmitForm";

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
