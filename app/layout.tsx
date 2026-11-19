import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// The font variable sits on <html>: the App shell tokens live on :root and read it from there.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Box Office | Seat map demo | Bookchaowalit",
  description: "A seat-map booking demo: choose open seats, leave a name, keep the booking in this browser. No payment or remote reservation.",
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: "Box Office | Seat map demo", description: "Choose open seats and keep the booking in your browser.", siteName: "Bookchaowalit" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={geistSans.variable}><body>{children}</body></html>;
}
