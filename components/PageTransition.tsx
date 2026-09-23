"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="flex flex-1 flex-col animate-page-in">
      {children}
    </div>
  );
}
