"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Cloud, Download, Images, LogOut, Plus, Search, Trash2, Upload, X, RefreshCw, CheckCircle2, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Photo = { id:string; storage_path:string; original_name:string; mime_type:string; size_bytes:number; created_at:string };
const MAX_FILE_SIZE=30*1024*1024;
const ALLOWED_TYPES=["image/jpeg","image/png","image/webp","image/gif","image/heic","image/heif"];
const readableError=(error:any)=>{
  const message=String(error?.message??error??"");
  const status=Number(error?.statusCode??error?.status??0);
  if(!message||/failed to fetch|networkerror|fetch failed|load failed/i.test(message))return "Não foi possível ligar ao servidor. Verifica a internet e tenta novamente.";
  if(status===401||/jwt|token.*expired|not authenticated/i.test(message))return "A tua sessão expirou. Inicia sessão novamente.";
  if(status===403||/permission|row-level security|not allowed/i.test(message))return "Não tens autorização para esta operação. Confirma a tua sessão e tenta novamente.";
  if(status===413||/payload too large|file size|entity too large/i.test(message))return "O ficheiro é demasiado grande. Escolhe uma imagem mais pequena.";
  if(status===429||/rate limit|too many requests/i.test(message))return "Muitas operações em pouco tempo. Aguarda um pouco e tenta novamente.";
  if(status>=500||/internal server|storage.*unavailable/i.test(message))return "O serviço está temporariamente indisponível. Tenta novamente dentro de instantes.";
  if(/duplicate|already exists/i.test(message))return "Este ficheiro já existe. Tenta novamente.";
  return "Não foi possível concluir a operação. Verifica a ligação e tenta novamente.";
};
async function optimizeImage(file:File):Promise<File>{
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size<450*1024)return file;
  try{
    const bitmap=await createImageBitmap(file);
    const maxSide=2200,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext("2d");if(!ctx){bitmap.close();return file;}
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const blob:Blob=await new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error("Não foi possível otimizar a imagem.")),"image/webp",0.82));
    if(blob.size>=file.size)return file;
    const base=file.name.replace(/\.[^.]+$/,"");
    return new File([blob],base+".webp",{type:"image/webp",lastModified:file.lastModified});
  }catch{return file;}
}
export default function GalleryPage(){
 const router=useRouter();const inputRef=useRef<HTMLInputElement>(null);const cameraRef=useRef<HTMLInputElement>(null);
 const [photos,setPhotos]=useState<Photo[]>([]);const [urls,setUrls]=useState<Record<string,string>>({});const [loading,setLoading]=useState(true);const [uploading,setUploading]=useState(false);const [progress,setProgress]=useState("");const [error,setError]=useState("");const [success,setSuccess]=useState("");const [userEmail,setUserEmail]=useState("");const [query,setQuery]=useState("");
 const load=useCallback(async()=>{
   setError("");
   try{
     const supabase=createClient();const {data:{user},error:userError}=await supabase.auth.getUser();
     if(userError)throw userError;
     if(!user){router.replace("/login");return null;}
     setUserEmail(user.email??"");
     const {data,error:dbError}=await supabase.from("photos").select("id,storage_path,original_name,mime_type,size_bytes,created_at").order("created_at",{ascending:false});
     if(dbError)throw dbError;
     const rows=(data??[]) as Photo[];setPhotos(rows);
     if(!rows.length){setUrls({});return user.id;}
     const {data:signedData,error:signedError}=await supabase.storage.from("photos").createSignedUrls(rows.map(photo=>photo.storage_path),3600);
     if(signedError)throw signedError;
     const byPath=new Map((signedData??[]).filter(item=>item.path&&item.signedUrl).map(item=>[item.path,item.signedUrl!]));
     const nextUrls:Record<string,string>={};for(const photo of rows){const url=byPath.get(photo.storage_path);if(url)nextUrls[photo.id]=url;}
     setUrls(nextUrls);return user.id;
   }catch(err){setError(readableError(err));return null;}
   finally{setLoading(false);}
 },[router]);
 useEffect(()=>{
   let active=true;let channel:any=null;const supabase=createClient();
   void(async()=>{const userId=await load();if(!active||!userId)return;channel=supabase.channel("gallery-"+userId).on("postgres_changes",{event:"*",schema:"public",table:"photos",filter:"user_id=eq."+userId},()=>{if(active)void load();}).subscribe();})();
   return()=>{active=false;if(channel)void supabase.removeChannel(channel);};
 },[load]);
 async function uploadFiles(files:FileList|null){
  if(!files?.length||uploading)return;
  setError("");setSuccess("");setUploading(true);
  try{
   const supabase=createClient();const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError)throw authError;if(!user){router.replace("/login");return;}
   let completed=0;const issues:string[]=[];const selected=Array.from(files);
   for(let i=0;i<selected.length;i++){
    const original=selected[i];
    if(!ALLOWED_TYPES.includes(original.type)){issues.push(original.name+": formato não suportado.");continue;}
    if(original.size>MAX_FILE_SIZE){issues.push(original.name+": excede o limite de 30 MB.");continue;}
    setProgress("A otimizar "+original.name+" ("+(i+1)+"/"+selected.length+")");
    const file=await optimizeImage(original);
    const ext=file.type==="image/webp"?"webp":(file.name.split(".").pop()?.toLowerCase()||"jpg");
    const path=user.id+"/"+crypto.randomUUID()+"."+ext;
    setProgress("A enviar "+original.name+" · "+(file.size/1024/1024).toFixed(1)+" MB");
    const {error:storageError}=await supabase.storage.from("photos").upload(path,file,{contentType:file.type,upsert:false,cacheControl:"3600"});
    if(storageError){issues.push(original.name+": "+readableError(storageError));continue;}
    const {error:dbError}=await supabase.from("photos").insert({user_id:user.id,storage_path:path,original_name:original.name,mime_type:file.type,size_bytes:file.size});
    if(dbError){await supabase.storage.from("photos").remove([path]);issues.push(original.name+": "+readableError(dbError));continue;}
    completed++;
   }
   if(completed)setSuccess(completed+" fotografia(s) adicionada(s) com sucesso.");
   if(issues.length)setError(issues.join(" "));
   await load();
  }catch(err){setError(readableError(err));}
  finally{setUploading(false);setProgress("");if(inputRef.current)inputRef.current.value="";if(cameraRef.current)cameraRef.current.value="";}
 }
 async function removePhoto(photo:Photo){
  if(!window.confirm("Apagar \""+photo.original_name+"\"? Esta ação não pode ser desfeita."))return;
  setError("");try{const supabase=createClient();const {error:storageError}=await supabase.storage.from("photos").remove([photo.storage_path]);if(storageError)throw storageError;const {error:dbError}=await supabase.from("photos").delete().eq("id",photo.id);if(dbError)throw dbError;setPhotos(current=>current.filter(item=>item.id!==photo.id));setUrls(current=>{const next={...current};delete next[photo.id];return next;});setSuccess("Fotografia apagada.");}catch(err){setError(readableError(err));}
 }
 async function downloadPhoto(photo:Photo){
  setError("");try{const supabase=createClient();const {data,error}=await supabase.storage.from("photos").download(photo.storage_path);if(error||!data)throw error??new Error("Download indisponível");const url=URL.createObjectURL(data);const a=document.createElement("a");a.href=url;a.download=photo.original_name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(err){setError(readableError(err));}
 }
 async function signOut(){try{const supabase=createClient();const {error}=await supabase.auth.signOut();if(error)throw error;router.replace("/login");router.refresh();}catch(err){setError(readableError(err));}}
 const filtered=photos.filter(photo=>photo.original_name.toLowerCase().includes(query.toLowerCase()));
 const buttonBase="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100";
 return <main className="min-h-screen bg-[#f7f8fc]"><header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Cloud size={22}/></span><span className="text-xl font-bold tracking-tight">APCLOUD</span></div><div className="flex items-center gap-3"><span className="hidden max-w-48 truncate text-sm text-slate-500 sm:block">{userEmail}</span><button onClick={signOut} className={buttonBase+" border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}><LogOut size={17}/> Sair</button></div></div></header>
 <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-blue-600">O teu espaço privado</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A minha galeria</h1><p className="mt-2 text-slate-500">{photos.length} fotografia(s) guardada(s) na nuvem</p></div><div className="grid grid-cols-2 gap-2 sm:flex"><button onClick={()=>cameraRef.current?.click()} disabled={uploading} className={buttonBase+" border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"}><Camera size={18}/> Câmara</button><button onClick={()=>inputRef.current?.click()} disabled={uploading} className={buttonBase+" bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-700"}>{uploading?<LoaderCircle className="animate-spin" size={18}/>:<Plus size={19}/>} {uploading?"A enviar...":"Adicionar fotografias"}</button><input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e:ChangeEvent<HTMLInputElement>)=>void uploadFiles(e.target.files)}/><input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e:ChangeEvent<HTMLInputElement>)=>void uploadFiles(e.target.files)}/></div></div>
 {uploading&&<div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm" role="status" aria-live="polite"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Upload size={18}/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">A guardar na tua nuvem</p><p className="truncate text-xs text-slate-500">{progress}</p></div><LoaderCircle className="animate-spin text-blue-600" size={20}/></div><p className="mt-3 text-xs text-slate-400">Mantém esta página aberta até terminar o envio.</p></div>}
 {success&&!uploading&&<div role="status" className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={18}/><span className="flex-1">{success}</span><button aria-label="Fechar mensagem" onClick={()=>setSuccess("")}><X size={17}/></button></div>}
 {error&&<div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-800"><span className="flex-1">{error}</span><button aria-label="Fechar erro" onClick={()=>setError("")}><X size={17}/></button></div>}
 <div className="mt-8 flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50"><Search size={19} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar fotografias..." className="w-full bg-transparent text-sm outline-none"/></div>
 {loading?<div className="mt-8" role="status" aria-live="polite"><div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Cloud size={21}/><span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-60"/></span><div><p className="text-sm font-semibold text-slate-800">A preparar o teu espaço...</p><p className="mt-0.5 text-xs text-slate-500">A carregar as tuas fotografias em segurança</p></div><LoaderCircle className="ml-auto animate-spin text-blue-600" size={20}/></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({length:8},(_,i)=><div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-square animate-pulse bg-slate-100"/><div className="space-y-2 p-3"><div className="h-3 w-3/4 animate-pulse rounded bg-slate-100"/><div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100"/></div></div>)}</div></div>:filtered.length===0?<div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Images size={28}/></span><h2 className="mt-5 text-xl font-semibold">{query?"Nenhum resultado":"A tua galeria está vazia"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{query?"Experimenta pesquisar por outro nome.":"Adiciona fotografias da galeria do teu dispositivo ou tira uma fotografia com a câmara."}</p>{!query&&<button onClick={()=>inputRef.current?.click()} className={buttonBase+" mt-6 bg-blue-600 text-white hover:bg-blue-700"}>Adicionar primeira fotografia</button>}</div>:<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filtered.map(photo=><article key={photo.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-square bg-slate-100">{urls[photo.id]?<img src={urls[photo.id]} alt={photo.original_name} loading="lazy" decoding="async" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-sm text-slate-400">Pré-visualização indisponível</div>}<div className="absolute inset-x-2 bottom-2 flex justify-end gap-2"><button aria-label="Descarregar fotografia" onClick={()=>void downloadPhoto(photo)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/70 bg-white/95 text-slate-700 shadow-md transition hover:scale-105 hover:bg-blue-50"><Download size={17}/></button><button aria-label="Apagar fotografia" onClick={()=>void removePhoto(photo)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/70 bg-white/95 text-red-600 shadow-md transition hover:scale-105 hover:bg-red-50"><Trash2 size={17}/></button></div></div><div className="p-3"><p className="truncate text-sm font-semibold text-slate-800">{photo.original_name}</p><p className="mt-1 text-xs text-slate-400">{(photo.size_bytes/1024/1024).toFixed(2)} MB · {new Date(photo.created_at).toLocaleDateString("pt-PT")}</p></div></article>)}</div>}
 </section></main>;
}