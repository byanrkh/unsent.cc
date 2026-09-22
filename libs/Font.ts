import { Google_Sans_Code, Newsreader } from "next/font/google";

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
});

export const jetbrainsMono = Google_Sans_Code({adjustFontFallback: true, subsets: ["latin"], weight: ["400", "500", "600", "700"] 
});