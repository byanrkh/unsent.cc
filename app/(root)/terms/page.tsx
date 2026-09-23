import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for unsent.cc.",
  alternates: {
    canonical: "/terms",
  },
  // Halaman ini masih stub (belum ada isinya) — di-noindex dulu biar Google
  // nggak nge-crawl halaman kosong. Hapus block "robots" ini begitu isinya udah jadi.
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <Container>/terms</Container>;
}
