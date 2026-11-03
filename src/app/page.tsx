import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Cloud, ShieldCheck, Camera, Images, ArrowRight } from "lucide-react";

export default async function Home() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    // The public landing page remains available before environment setup.
  }

  if (signedIn) redirect("/gallery");

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white"><Cloud size={22}/></span>
          <span className="text-xl">APCLOUD</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Entrar</Link>
          <Link href="/signup" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">Criar conta</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"><ShieldCheck size={16}/> O teu espaço privado na nuvem</div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">As tuas memórias. <span className="text-blue-600">Sempre contigo.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">Guarda fotografias num espaço seguro, acede a elas pelo telemóvel ou computador e mantém os teus momentos importantes organizados.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700">Começar gratuitamente <ArrowRight size={18}/></Link>
            <Link href="/login" className="rounded-xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50">Já tenho conta</Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-7 text-sm text-slate-500">
            <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-blue-600"/> Ficheiros privados</span>
            <span className="flex items-center gap-2"><Camera size={17} className="text-blue-600"/> Câmara e galeria</span>
            <span className="flex items-center gap-2"><Images size={17} className="text-blue-600"/> Acesso em qualquer dispositivo</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-[3rem] bg-blue-100/70 blur-3xl"/>
          <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-7">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-900">A tua galeria</p><p className="mt-1 text-xs text-slate-400">Um lugar para cada memória</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Privado</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex h-48 items-end rounded-2xl bg-gradient-to-br from-blue-200 via-indigo-200 to-violet-300 p-5"><div className="rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 backdrop-blur">Momentos especiais</div></div>
              <div className="h-32 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200"/>
              <div className="h-32 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200"/>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-500">As tuas fotografias, sempre acessíveis</span><Cloud size={19} className="text-blue-600"/></div>
          </div>
        </div>
      </section>
    </main>
  );
}