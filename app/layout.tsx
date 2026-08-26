import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import SwRegister from "./sw-register";

const roboto = localFont({
  src: [
    { path: "../lib/fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../lib/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-roboto",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Diagrams",
  description:
    "Beautiful diagram generator — paste any diagram syntax and get a polished visual instantly.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://diagrams-bheng.vercel.app",
  ),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diagrams",
  },
  openGraph: {
    title: "Diagrams — Sequence Diagram Generator",
    description: "Paste diagram syntax, get beautiful diagrams instantly.",
    type: "website",
    url:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://diagrams-bheng.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagrams — Sequence Diagram Generator",
    description: "Paste diagram syntax, get beautiful diagrams instantly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <SwRegister />
      </body>
    </html>
  );
}
