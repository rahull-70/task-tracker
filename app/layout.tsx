import type { Metadata } from "next";
import { Oi, Luckiest_Guy, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const oi = Oi({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-oi",
});

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
});

export const metadata: Metadata = {
  title: "Task Tracker | Track your Task",
  description: "Track your task minimalistly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", oi.variable, luckiestGuy.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}