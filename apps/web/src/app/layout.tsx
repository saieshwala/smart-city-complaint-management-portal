import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicConnect India - Citizen Complaint Portal",
  description:
    "Report civic issues like garbage, damaged roads, broken signals, water leaks and more. Track complaints in real-time and help improve your city.",
  keywords: [
    "civic complaints",
    "citizen portal",
    "report problem",
    "municipal complaints",
    "India",
    "smart city",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
