import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paytm AI Merchant Copilot",
  description: "AI-powered merchant onboarding for Indian small businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
