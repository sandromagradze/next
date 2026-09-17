import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPN",
  description: "ინტერპრესნიუსი",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  );
}