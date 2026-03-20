import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import DemoBadge from "@/components/ui/demo-badge";

const sansFallback = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
});
const monoFallback = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PayLens",
  description: "Know your market value with miCoach-aligned insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sansFallback.variable} ${monoFallback.variable} font-sans`}>
        <Suspense fallback={null}>
          <DemoBadge />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
