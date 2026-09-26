import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import Toast from "@/components/Toast";
import FloatingPostButton from "@/components/FloatingPostButton";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <FloatingPostButton />
      <Toast />
    </>
  );
}
