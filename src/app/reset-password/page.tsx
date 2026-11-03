"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage(){
 const router=useRouter();const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");try{const supabase=createClient();const {error}=await supabase.auth.updateUser({password});if(error)throw error;router.replace("/gallery");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Não foi possível atualizar a palavra-passe.");}finally{setBusy(false);}}
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10"><h1 className="text-3xl font-semibold">Nova palavra-passe</h1><p className="mt-2 text-slate-500">Escolhe uma palavra-passe segura para a tua conta.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-medium">Nova palavra-passe<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/></label>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white disabled:opacity-60">{busy?"A guardar...":"Guardar palavra-passe"}</button></form><p className="mt-6 text-center text-sm"><Link href="/login" className="text-blue-600">Voltar ao login</Link></p></div></main>;
}