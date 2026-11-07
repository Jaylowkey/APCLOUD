import type { Metadata, Viewport } from "next";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "APCLOUD — Your memories, safely stored",
  description: "A private space for your photos, backed up in the cloud.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "APCLOUD" },
  icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" }
};

export const viewport: Viewport = {
  themeColor: "#2455e8",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body><PWARegister />{children}</body>
    </html>
  );
}