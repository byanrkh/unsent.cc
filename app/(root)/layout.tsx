import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </>
  );
}
