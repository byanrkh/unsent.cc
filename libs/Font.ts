import { Edu_SA_Hand,  Newsreader } from "next/font/google";

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
});

export const Mono = Edu_SA_Hand({
  adjustFontFallback: false, 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"]
});