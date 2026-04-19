import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KUMU | Cricket Coaching App for Players, Parents & Coaches",
  description: "KUMU is the cricket coaching app for players, parents, coaches & teachers. 300+ structured drills across batting, bowling & fielding. Download on the App Store",
  icons: {
    icon: "https://res.cloudinary.com/dgmjg9zr4/image/upload/v1776585721/WhatsApp_Image_2026-04-18_at_11.40.50_PM_uwim4j.jpg",
    apple: "https://res.cloudinary.com/dgmjg9zr4/image/upload/v1776585721/WhatsApp_Image_2026-04-18_at_11.40.50_PM_uwim4j.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
