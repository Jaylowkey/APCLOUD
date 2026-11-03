import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APCLOUD — Your memories, safely stored",
  description: "A private space for your photos, backed up in the cloud."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}