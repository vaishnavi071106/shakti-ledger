import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from '@/components/ClientWrapper';
import NoSSR from '@/components/NoSSR';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Shakti Ledger',
  description: 'On-chain SHG treasury & micro-credit',
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
        suppressHydrationWarning={true}
      >
        <NoSSR fallback={<div style={{ minHeight: '100vh' }}>Loading...</div>}>
          <ClientWrapper>{children}</ClientWrapper>
        </NoSSR>
      </body>
    </html>
  );
}
