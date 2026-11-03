"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cloud, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmEmailPage(){
  const router=useRouter();
  const params=useSearchParams();
  const [email,setEmail]=useState(params.get("email")??"");
  const [token,setToken]=useState("");
  const [busy,setBusy]=useState(false);
  const [resending,setResending]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{setEmail(params.get("email")??"");},[params]);
  async function verify(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      const {error}=await createClient().auth.verifyOtp({email:email.trim(),token:token.trim(),type:"signup"});
      if(error)throw error;
      setMessage("Email confirmado com sucesso. A abrir a tua galeria...");
      router.replace("/gallery");router.refresh();
    }catch(e){
      const m=e instanceof Error?e.message.toLowerCase():"";
      if(m.includes("expired"))setError("Este código expirou. Pede um novo código e tenta novamente.");
      else if(m.includes("invalid")||m.includes("token"))setError("O código não está correto. Confirma os 6 dígitos e tenta novamente.");
      else if(m.includes("too many"))setError("Atingiste o limite de tentativas. Aguarda alguns minutos.");
      else setError("Não foi possível confirmar o email. Verifica o código e tenta novamente.");
    }finally{setBusy(false);}
  }
  async function resend(){
    if(!email.trim()){setError("Introduz o teu email para receberes um novo código.");return;}
    setResending(true);setError("");setMessage("");
    const {error}=await createClient().auth.resend({type:"signup",email:email.trim()});
    if(error)setError(error.message.toLowerCase().includes("too many")?"Atingiste o limite de reenvios. Aguarda alguns minutos.":"Não foi possível reenviar o código. Confirma o email e tenta novamente.");
    else setMessage("Enviámos um novo código. Verifica também a pasta de spam.");
    setResending(false);
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
    <Link href="/" className="mb-10 flex items-center gap-2 text-lg font-semibold"><Cloud className="text-blue-600"/> APCLOUD</Link>
    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><MailCheck size={28}/></span>
    <h1 className="mt-6 text-3xl font-semibold tracking-tight">Confirma o teu email</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">Enviámos um código de confirmação para o teu email. Introduz os 6 dígitos para ativar a tua conta.</p>
    <form onSubmit={verify} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
      <label className="block text-sm font-medium text-slate-700">Código de confirmação<input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} minLength={6} pattern="[0-9]{6}" value={token} onChange={e=>setToken(e.target.value.replace(/\\D/g,"").slice(0,6))} placeholder="000000" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-4 text-center text-2xl font-semibold tracking-[.5em] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/></label>
      {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button disabled={busy||token.length!==6} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy?"A confirmar...":"Confirmar email"}</button>
    </form>
    <button onClick={()=>void resend()} disabled={resending} className="mt-5 w-full text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50">{resending?"A reenviar...":"Não recebeste o código? Reenviar"}</button>
    <p className="mt-7 text-center text-sm text-slate-500"><Link href="/signup" className="font-semibold text-blue-600">Voltar ao registo</Link> · <Link href="/login" className="font-semibold text-blue-600">Entrar</Link></p>
  </div></main>;
}
