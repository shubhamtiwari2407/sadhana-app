import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-worksans",
});

export const metadata: Metadata = {
  title: "Sadhana Circle",
  description: "Track your daily sadhana. Grow together.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFF8EC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-body">
        <div className="max-w-md mx-auto relative min-h-screen">
          <main className="px-4 pt-6 pb-24">
            <PullToRefresh>{children}</PullToRefresh>
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}