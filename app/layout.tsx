import "./globals.css";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import type { Metadata } from "next";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "عنان AI",
  description: "المساعد الذكي للبحث عن العقارات",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content", // Key for mobile keyboard behavior
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ConditionalNavbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
