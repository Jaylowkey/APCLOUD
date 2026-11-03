"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Cloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage(){
  const [email,setEmail]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMessage("");try{const supabase=createClient();const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setMessage("Se o endereço estiver registado, receberás um email com instruções para redefinir a palavra-passe.");}catch(e){setError(e instanceof Error?e.message:"Não foi possível enviar o email.");}finally{setBusy(false);}}
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10"><Link href="/" className="mb-9 flex items-center gap-2 text-lg font-semibold"><Cloud className="text-blue-600"/> APCLOUD</Link><h1 className="text-3xl font-semibold">Recuperar acesso</h1><p className="mt-2 text-slate-500">Vamos enviar um link para redefinires a tua palavra-passe.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/></label>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message&&<p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white disabled:opacity-60">{busy?"A enviar...":"Enviar link"}</button></form><p className="mt-7 text-center text-sm"><Link href="/login" className="font-semibold text-blue-600">Voltar ao login</Link></p></div></main>;
}