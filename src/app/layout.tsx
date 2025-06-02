import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evolve Pokédex - Complete Pokémon Reference",
  description:
    "Your comprehensive resource for Pokémon information. Search through our complete database of Pokémon species, moves, abilities, and more.",
  keywords: [
    "pokemon",
    "pokedex",
    "pokemon database",
    "pokemon search",
    "pokemon types",
    "pokemon moves",
  ],
  authors: [{ name: "Adam Honoré" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
  openGraph: {
    title: "Evolve Pokédex - Complete Pokémon Reference",
    description:
      "Your comprehensive resource for Pokémon information. Search through our complete database of Pokémon species, moves, abilities, and more.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-[320px]`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  );
}
