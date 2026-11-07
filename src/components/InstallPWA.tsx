"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        <Download size={17} />
        Instalar app
      </button>
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHelp(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="install-help-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Smartphone size={23} /></span>
              <button type="button" aria-label="Fechar" onClick={() => setShowHelp(false)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <h2 id="install-help-title" className="mt-4 text-xl font-bold text-slate-900">Instalar APCLOUD</h2>
            {isIOS ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
                <li>Abre o APCLOUD no Safari.</li>
                <li>Toca em <strong>Partilhar</strong> (ícone do quadrado com seta).</li>
                <li>Escolhe <strong>Adicionar ao ecrã principal</strong> e confirma.</li>
              </ol>
            ) : (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
                <li>Abre o menu do navegador (⋮ ou ⋯).</li>
                <li>Escolhe <strong>Instalar aplicação</strong> ou <strong>Adicionar ao ecrã inicial</strong>.</li>
                <li>Confirma a instalação do APCLOUD.</li>
              </ol>
            )}
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">A opção pode variar conforme o navegador e o dispositivo.</p>
            <button type="button" onClick={() => setShowHelp(false)} className="mt-5 min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Entendi</button>
          </section>
        </div>
      )}
    </>
  );
}
