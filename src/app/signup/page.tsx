"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase=createClient();
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${window.location.origin}/auth/callback?next=/gallery`}});
      if(error) throw error;
      if(data.session){router.replace("/gallery");router.refresh();}
      else setMessage("Conta criada. Verifica o teu email para confirmares o registo antes de entrar.");
    } catch(e){setError(e instanceof Error?e.message:"Não foi possível criar a conta.");}
    finally{setBusy(false);}
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
    <Link href="/" className="mb-9 flex items-center gap-2 text-lg font-semibold"><Cloud className="text-blue-600"/> APCLOUD</Link>
    <h1 className="text-3xl font-semibold tracking-tight">Criar conta</h1><p className="mt-2 text-slate-500">Começa a guardar as tuas fotografias em segurança.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">Nome<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
      <label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
      <label className="block text-sm font-medium text-slate-700">Palavra-passe<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><span className="mt-1 block text-xs text-slate-400">Mínimo de 8 caracteres.</span></label>
      {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy?"A criar conta...":"Criar conta"}</button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">Já tens conta? <Link href="/login" className="font-semibold text-blue-600">Entrar</Link></p>
  </div></main>;
}