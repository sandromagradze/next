import type { Metadata } from "next";
import QueryProvider from "@/components/Providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPN",
  description: "InterPressNews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}