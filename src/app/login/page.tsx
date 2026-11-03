"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/gallery"); router.refresh();
    } catch (e) { const m=e instanceof Error?e.message.toLowerCase():""; if(m.includes("invalid login credentials"))setError("Email ou palavra-passe incorretos. Confirma os teus dados e tenta novamente."); else if(m.includes("email not confirmed"))setError("Ainda falta confirmar o teu email. Introduz o código enviado para a tua caixa de entrada."); else if(m.includes("too many requests"))setError("Foram feitas demasiadas tentativas. Aguarda alguns minutos e tenta novamente."); else if(m.includes("network")||m.includes("fetch"))setError("Não foi possível ligar ao servidor. Verifica a tua ligação à internet."); else setError("Não foi possível iniciar sessão. Verifica os dados e tenta novamente."); }
    finally { setBusy(false); }
  }

  return <main className="grid min-h-screen bg-white lg:grid-cols-2">
    <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white lg:flex">
      <Link href="/" className="flex items-center gap-3 text-xl font-semibold"><Cloud/> APCLOUD</Link>
      <div className="max-w-lg"><p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-blue-200">Bem-vindo de volta</p><h1 className="text-5xl font-semibold leading-tight">As tuas memórias merecem um lugar seguro.</h1><p className="mt-6 text-lg leading-8 text-blue-100">Entra na tua conta e continua a organizar os teus momentos.</p></div>
      <p className="text-sm text-blue-200">O teu espaço. As tuas memórias.</p>
    </section>
    <section className="flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-12 flex items-center gap-2 text-lg font-semibold lg:hidden"><Cloud className="text-blue-600"/> APCLOUD</Link>
        <h2 className="text-3xl font-semibold tracking-tight">Entrar na tua conta</h2><p className="mt-2 text-slate-500">Introduz os teus dados para aceder à galeria.</p>
        <form onSubmit={submit} className="mt-9 space-y-5">
          <label className="block text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
          <label className="block text-sm font-medium text-slate-700">Palavra-passe<span className="mt-2 flex rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><input required type={visible?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="min-w-0 flex-1 rounded-xl px-4 py-3 outline-none"/><button type="button" onClick={()=>setVisible(!visible)} className="px-4 text-slate-400">{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
          <div className="text-right"><Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Esqueci-me da palavra-passe</Link></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy?"A entrar...":"Entrar"}</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">Ainda não tens conta? <Link href="/signup" className="font-semibold text-blue-600">Criar conta</Link></p>
      </div>
    </section>
  </main>;
}