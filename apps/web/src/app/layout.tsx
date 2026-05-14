import type { Metadata, Viewport } from "next";
import { Archivo_Black, Allura, IBM_Plex_Mono, Inter } from "next/font/google";

import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo-heavy",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo-script",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  title: {
    default: "MADRID Aire",
    template: "%s | MADRID Aire",
  },
  description:
    "A living atmospheric atlas of Madrid built on official observations, honest modeling, and premium editorial design.",
  applicationName: "MADRID Aire",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${allura.variable} ${inter.variable} ${ibmPlexMono.variable} bg-graphite text-soft antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
