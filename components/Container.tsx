import React from "react";

export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <main className="px-6 sm:px-10">
      <div className="mx-auto max-w-175 w-full py-5 sm:py-10">{children}</div>
    </main>
  );
}
