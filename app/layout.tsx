import type { Metadata, Viewport } from "next";
import { Marcellus, Nunito, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import ReminderScheduler from "@/components/ReminderScheduler";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Sadhana Circle",
  description: "Track your daily sadhana. Grow together.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFF9F2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${marcellus.variable} ${nunito.variable} ${poppins.variable}`}>
      <body className="font-body">
        <div className="max-w-md mx-auto relative min-h-screen">
          <main className="px-4 pt-6 pb-28">
            <PullToRefresh>{children}</PullToRefresh>
          </main>
          <BottomNav />
          <ReminderScheduler />
        </div>
      </body>
    </html>
  );
}