"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AppBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/" || /^\/(login|signup|forgot-password|reset-password)(\/|$)/.test(pathname)) return null;

  function goBack() {
    const fallback = pathname.startsWith("/share/") ? "/gallery"
      : pathname.startsWith("/settings/") ? "/dashboard"
      : pathname === "/dashboard" ? "/gallery"
      : "/dashboard";

    const referrer = document.referrer;
    const cameFromThisApp = !!referrer && new URL(referrer).origin === window.location.origin;
    if (cameFromThisApp && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Voltar à página anterior"
      title="Voltar"
      className="fixed bottom-5 left-4 z-[100] inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:bottom-auto sm:top-20"
    >
      <ArrowLeft size={18} />
      <span>Voltar</span>
    </button>
  );
}
