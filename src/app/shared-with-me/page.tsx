"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cloud, Download, FileText, LoaderCircle, Share2 } from "lucide-react";

type SharedItem = { id: string; created_at: string; sender_email: string; file: { original_name: string; mime_type: string; size_bytes: number } };

export default function SharedWithMePage() {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/file-shares").then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar os ficheiros.");
      if (active) setItems(body.shares ?? []);
    }).catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function openFile(item: SharedItem) {
    setOpening(item.id); setError("");
    try {
      const response = await fetch("/api/file-shares/" + item.id);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível abrir o ficheiro.");
      const anchor = document.createElement("a");
      anchor.href = body.file.url;
      anchor.download = body.file.name;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao abrir ficheiro."); }
    finally { setOpening(null); }
  }

  return <main className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-4">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white"><Cloud size={21}/></span>
      <strong className="text-lg text-slate-950">APCLOUD</strong>
      <Link href="/gallery" className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"><ArrowLeft size={16}/> Voltar à galeria</Link>
    </div></header>
    <section className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Share2 size={23}/></span><div><h1 className="text-2xl font-bold text-slate-950">Partilhados comigo</h1><p className="mt-1 text-sm text-slate-500">Ficheiros que outros utilizadores APCLOUD partilharam contigo.</p></div></div>
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> A carregar...</div> :
        items.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><FileText size={34} className="mx-auto text-slate-300"/><h2 className="mt-4 font-semibold text-slate-800">Ainda não recebeste ficheiros</h2><p className="mt-2 text-sm text-slate-500">Quando alguém partilhar um ficheiro contigo, ele aparecerá aqui.</p></div> :
        <div className="mt-8 space-y-3">{items.map(item => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><FileText size={21}/></span>
          <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-slate-900">{item.file.original_name}</h2><p className="mt-1 text-xs text-slate-500">Enviado por {item.sender_email} · {(item.file.size_bytes / 1024 / 1024).toFixed(2)} MB</p><p className="mt-1 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString("pt-PT")}</p></div>
          <button disabled={opening === item.id} onClick={() => void openFile(item)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{opening === item.id ? <LoaderCircle size={16} className="animate-spin"/> : <Download size={16}/>} Abrir / Descarregar</button>
        </article>)}</div>}
    </section>
  </main>;
}
