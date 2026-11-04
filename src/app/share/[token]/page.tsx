"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cloud, Download, ImageOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SharedPhoto = { original_name: string; signed_url: string; expires_at: string };

export default function SharedPhotoPage() {
  const params = useParams<{ token: string }>();
  const [photo, setPhoto] = useState<SharedPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("get_public_photo_share", { share_token: params.token });
        if (error) throw error;
        const item = Array.isArray(data) ? data[0] : null;
        if (!item || new Date(item.expires_at).getTime() <= Date.now()) {
          if (active) setExpired(true);
          return;
        }
        if (active) setPhoto(item as SharedPhoto);
      } catch {
        if (active) setExpired(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [params.token]);

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8fc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white"><Cloud size={21}/></span>
          <span className="text-lg font-bold tracking-tight text-slate-950">APCLOUD</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><ShieldCheck size={15}/> Partilha privada</span>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-10">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm"><LoaderCircle className="animate-spin text-blue-600" size={20}/> A abrir fotografia partilhada...</div>
        ) : expired || !photo ? (
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-7 py-12 text-center shadow-sm">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-500"><ImageOff size={28}/></span>
            <h1 className="mt-5 text-xl font-bold text-slate-900">Link indisponível</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Este link pode ter expirado ou ter sido removido pelo proprietário.</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0"><h1 className="truncate text-sm font-semibold text-slate-900">{photo.original_name}</h1><p className="mt-1 text-xs text-slate-500">Disponível até {new Date(photo.expires_at).toLocaleString("pt-PT")}</p></div>
              <a href={photo.signed_url} download={photo.original_name} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Download size={16}/> Descarregar</a>
            </div>
            <div className="flex min-h-64 items-center justify-center bg-slate-950 p-3 sm:p-6">
              <img src={photo.signed_url} alt={photo.original_name} className="max-h-[72vh] max-w-full object-contain"/>
            </div>
            <p className="px-5 py-3 text-center text-xs text-slate-400">Fotografia partilhada através do APCLOUD</p>
          </div>
        )}
      </section>
      <footer className="py-5 text-center text-xs text-slate-400">APCLOUD · O teu espaço privado na nuvem</footer>
    </main>
  );
}
