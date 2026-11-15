import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, Check, Cloud, CloudUpload, Images, LockKeyhole, MonitorSmartphone, ShieldCheck, Sparkles, Zap } from "lucide-react";

const photo = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export default async function Home() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    // Keep the public landing page available before environment setup.
  }
  if (signedIn) redirect("/gallery");

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fd] text-slate-950">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Cloud size={23}/></span><span className="text-xl font-extrabold tracking-tight">AP<span className="text-blue-600">CLOUD</span></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"><a href="#vantagens" className="transition hover:text-blue-600">Vantagens</a><a href="#seguranca" className="transition hover:text-blue-600">Privacidade</a><a href="#como-funciona" className="transition hover:text-blue-600">Como funciona</a></nav>
        <div className="flex items-center gap-2 sm:gap-3"><Link href="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:px-4">Entrar</Link><Link href="/signup" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-5">Criar conta</Link></div>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[.94fr_1.06fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-16">
        <div className="pointer-events-none absolute -left-48 top-0 h-[28rem] w-[28rem] rounded-full bg-blue-200/40 blur-3xl"/>
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[.13em] text-blue-700 shadow-sm"><Sparkles size={15}/> O teu espaço digital</div>
          <h1 className="max-w-2xl text-[2.85rem] font-extrabold leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-[4.35rem]">Tudo o que importa, <span className="text-blue-600">num só lugar.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Guarda fotografias e ficheiros na nuvem. Acede aos teus momentos no telemóvel ou computador e partilha com quem quiseres, sempre com controlo sobre os teus ficheiros.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 text-base font-bold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-700">Começar gratuitamente <ArrowRight size={19}/></Link><Link href="/login" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-base font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">Já tenho conta</Link></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500"><span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Acesso simples</span><span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Ficheiros organizados</span><span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Partilha controlada</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -inset-7 rounded-[3rem] bg-gradient-to-br from-blue-200/70 via-indigo-100/60 to-sky-100 blur-3xl"/>
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_30px_100px_-35px_rgba(37,77,160,.35)] sm:rounded-[2.5rem] sm:p-5">
            <div className="flex items-center justify-between px-3 pb-4 pt-2 sm:px-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Images size={20}/></span><div><p className="text-sm font-bold text-slate-900">A tua biblioteca</p><p className="text-xs text-slate-400">As tuas memórias, organizadas</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">Espaço privado</span></div>
            <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
              <div className="relative col-span-7 row-span-2 min-h-64 overflow-hidden rounded-2xl sm:min-h-[19rem]"><img src={photo("photo-1500530855697-b586d89ba3ee")} alt="Paisagem de montanha ao pôr do sol" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent"/><div className="absolute bottom-4 left-4 text-white"><p className="text-xs font-medium text-white/75">Colecção em destaque</p><p className="mt-1 text-lg font-bold">Momentos especiais</p></div></div>
              <div className="relative col-span-5 min-h-32 overflow-hidden rounded-2xl sm:min-h-[9.2rem]"><img src={photo("photo-1500534623283-312aade485b7",600)} alt="Paisagem natural" className="absolute inset-0 h-full w-full object-cover"/></div>
              <div className="relative col-span-5 min-h-32 overflow-hidden rounded-2xl sm:min-h-[9.2rem]"><img src={photo("photo-1490750967868-88aa4486c946",600)} alt="Flores coloridas" className="absolute inset-0 h-full w-full object-cover"/></div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f4f7fc] px-4 py-3.5 sm:px-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><CloudUpload size={18}/></span><div><p className="text-xs font-bold text-slate-800">Tudo num só espaço</p><p className="text-[11px] text-slate-400">Fotografias e ficheiros sempre à mão</p></div></div><span className="hidden items-center gap-1 text-xs font-bold text-emerald-600 sm:flex"><ShieldCheck size={15}/> Privado</span></div>
          </div>
          <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:flex lg:-left-9"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><MonitorSmartphone size={20}/></span><div><p className="text-xs font-bold text-slate-800">Em qualquer dispositivo</p><p className="text-[11px] text-slate-400">Telemóvel ou computador</p></div></div>
        </div>
      </section>

      <section id="vantagens" className="border-y border-slate-100 bg-white py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-600">Mais do que guardar</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Os teus ficheiros. À tua maneira.</h2><p className="mt-4 text-base leading-7 text-slate-500">Uma experiência simples para manter fotografias e documentos acessíveis e bem organizados.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-100 bg-[#f8faff] p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700"><Camera size={23}/></span><h3 className="mt-6 text-lg font-bold">A tua galeria pessoal</h3><p className="mt-2 text-sm leading-6 text-slate-500">Reúne as tuas fotografias num só lugar e organiza-as em álbuns para encontrares cada momento facilmente.</p></article>
          <article className="rounded-3xl border border-slate-100 bg-[#f8faff] p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><LockKeyhole size={23}/></span><h3 className="mt-6 text-lg font-bold">Privacidade sob controlo</h3><p className="mt-2 text-sm leading-6 text-slate-500">Os teus ficheiros são privados por defeito. Escolhe quando criar links para partilhar.</p></article>
          <article className="rounded-3xl border border-slate-100 bg-[#f8faff] p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Zap size={23}/></span><h3 className="mt-6 text-lg font-bold">Acesso simples</h3><p className="mt-2 text-sm leading-6 text-slate-500">Continua o teu trabalho entre dispositivos e mantém os teus ficheiros disponíveis quando precisares.</p></article>
        </div></div></section>

      <section id="seguranca" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div className="relative min-h-[19rem] overflow-hidden rounded-[2rem] sm:min-h-[25rem]"><img src={photo("photo-1516321318423-f06f85e504b3",1100)} alt="Pessoa a trabalhar num computador portátil" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-tr from-blue-950/70 via-blue-900/10 to-transparent"/><div className="absolute bottom-6 left-6 right-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-100">APCLOUD</p><p className="mt-2 max-w-sm text-2xl font-bold leading-tight">O teu mundo digital, organizado num só lugar.</p></div></div>
        <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-600">Privado por defeito</p><h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Partilha apenas aquilo que quiseres.</h2><p className="mt-5 text-base leading-8 text-slate-600">Mantém os teus ficheiros na tua biblioteca e cria links de partilha quando quiseres enviar uma fotografia ou documento. Tu decides o que partilhar.</p><ul className="mt-7 space-y-3 text-sm font-medium text-slate-600"><li className="flex items-center gap-3"><Check size={17} className="text-emerald-500"/> Biblioteca privada</li><li className="flex items-center gap-3"><Check size={17} className="text-emerald-500"/> Links de partilha com validade</li><li className="flex items-center gap-3"><Check size={17} className="text-emerald-500"/> Acesso a partir dos teus dispositivos</li></ul><Link href="/signup" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Experimentar APCLOUD <ArrowRight size={17}/></Link></div>
      </section>

      <section id="como-funciona" className="bg-[#101d3b] px-5 py-16 text-white sm:px-8 sm:py-20"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-300">Começa hoje</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">As tuas memórias merecem um lugar especial.</h2><p className="mt-4 text-sm leading-7 text-slate-300">Cria a tua conta e começa a organizar os teus ficheiros no APCLOUD.</p></div><Link href="/signup" className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-2xl bg-white px-7 text-sm font-extrabold text-blue-700 transition hover:-translate-y-1 hover:bg-blue-50">Criar conta gratuita <ArrowRight size={18}/></Link></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:px-8 lg:px-10"><Link href="/" className="font-extrabold tracking-tight text-slate-700">AP<span className="text-blue-600">CLOUD</span></Link><p>Os teus ficheiros, no teu espaço.</p><div className="flex gap-5"><Link href="/login" className="hover:text-blue-600">Entrar</Link><Link href="/signup" className="hover:text-blue-600">Criar conta</Link></div></footer>
    </main>
  );
}
