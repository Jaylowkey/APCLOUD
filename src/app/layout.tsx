import type { Metadata, Viewport } from "next";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "APCLOUD — Os teus ficheiros, no teu espaço",
  description: "Guarda, organiza e partilha fotografias e ficheiros num espaço privado na nuvem.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "APCLOUD" },
  icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" }
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
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
