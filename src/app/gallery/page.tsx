"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Cloud, Download, Images, LogOut, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Photo = { id:string; storage_path:string; original_name:string; mime_type:string; size_bytes:number; created_at:string };
const MAX_FILE_SIZE=20*1024*1024;
const ALLOWED_TYPES=["image/jpeg","image/png","image/webp","image/gif","image/heic","image/heif"];

export default function GalleryPage(){
 const router=useRouter();const inputRef=useRef<HTMLInputElement>(null);const cameraRef=useRef<HTMLInputElement>(null);
 const [photos,setPhotos]=useState<Photo[]>([]);const [urls,setUrls]=useState<Record<string,string>>({});const [loading,setLoading]=useState(true);const [uploading,setUploading]=useState(false);const [progress,setProgress]=useState("");const [error,setError]=useState("");const [userEmail,setUserEmail]=useState("");const [query,setQuery]=useState("");
 const load=useCallback(async()=>{
   const supabase=createClient();
   const {data:{user},error:userError}=await supabase.auth.getUser();
   if(userError||!user){router.replace("/login");return null;}
   setUserEmail(user.email??"");
   const {data,error}=await supabase.from("photos").select("id,storage_path,original_name,mime_type,size_bytes,created_at").order("created_at",{ascending:false});
   if(error){setError("Não foi possível carregar as fotografias. Tenta novamente.");setLoading(false);return user.id;}
   const rows=(data??[]) as Photo[];
   setPhotos(rows);
   if(rows.length===0){setUrls({});setLoading(false);return user.id;}
   // Sign all private image URLs in one Storage request instead of one request per photo.
   const {data:signedData,error:signedError}=await supabase.storage.from("photos").createSignedUrls(rows.map(photo=>photo.storage_path),3600);
   if(signedError){setError("As fotografias foram carregadas, mas algumas imagens não puderam ser abertas.");}
   const nextUrls:Record<string,string>={};
   for(const item of signedData??[]){
     const photo=rows.find(row=>row.storage_path===item.path);
     if(photo&&item.signedUrl)nextUrls[photo.id]=item.signedUrl;
   }
   setUrls(nextUrls);
   setLoading(false);
   return user.id;
 },[router]);
 useEffect(()=>{
   let active=true;let channel:any=null;
   const supabase=createClient();
   void(async()=>{
     const userId=await load();
     if(!active||!userId)return;
     channel=supabase.channel(`photos-${userId}`).on("postgres_changes",{event:"*",schema:"public",table:"photos",filter:`user_id=eq.${userId}`},()=>{if(active)void load();}).subscribe();
   })();
   return()=>{active=false;if(channel)void supabase.removeChannel(channel);};
 },[load]);
 async function uploadFiles(files:FileList|null){if(!files?.length)return;setError("");setUploading(true);const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}let completed=0;for(const file of Array.from(files)){if(!ALLOWED_TYPES.includes(file.type)){setError(`${file.name}: formato não suportado.`);continue;}if(file.size>MAX_FILE_SIZE){setError(`${file.name}: excede o limite de 20 MB.`);continue;}const extension=file.name.split(".").pop()?.toLowerCase()||"jpg";const path=`${user.id}/${crypto.randomUUID()}.${extension}`;setProgress(`A enviar ${file.name}...`);const {error:storageError}=await supabase.storage.from("photos").upload(path,file,{contentType:file.type,upsert:false});if(storageError){setError(storageError.message);continue;}const {error:dbError}=await supabase.from("photos").insert({user_id:user.id,storage_path:path,original_name:file.name,mime_type:file.type,size_bytes:file.size});if(dbError){await supabase.storage.from("photos").remove([path]);setError(dbError.message);continue;}completed++;}setUploading(false);setProgress(completed?`${completed} fotografia(s) enviada(s).`:"");await load();if(inputRef.current)inputRef.current.value="";if(cameraRef.current)cameraRef.current.value="";}
 async function removePhoto(photo:Photo){if(!window.confirm(`Apagar "${photo.original_name}"? Esta ação não pode ser desfeita.`))return;const supabase=createClient();const {error:storageError}=await supabase.storage.from("photos").remove([photo.storage_path]);if(storageError){setError(storageError.message);return;}const {error:dbError}=await supabase.from("photos").delete().eq("id",photo.id);if(dbError){setError(dbError.message);return;}setPhotos(current=>current.filter(item=>item.id!==photo.id));}
 async function downloadPhoto(photo:Photo){const supabase=createClient();const {data,error}=await supabase.storage.from("photos").download(photo.storage_path);if(error||!data){setError(error?.message??"Download falhou.");return;}const url=URL.createObjectURL(data);const a=document.createElement("a");a.href=url;a.download=photo.original_name;a.click();URL.revokeObjectURL(url);}
 async function signOut(){const supabase=createClient();await supabase.auth.signOut();router.replace("/login");router.refresh();}
 const filtered=photos.filter(photo=>photo.original_name.toLowerCase().includes(query.toLowerCase()));
 return <main className="min-h-screen bg-[#f7f8fc]"><header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white"><Cloud size={21}/></span><span className="text-lg font-semibold">APCLOUD</span></div><div className="flex items-center gap-3"><span className="hidden max-w-48 truncate text-sm text-slate-500 sm:block">{userEmail}</span><button onClick={signOut} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><LogOut size={16}/> Sair</button></div></div></header>
 <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">O teu espaço privado</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">A minha galeria</h1><p className="mt-2 text-slate-500">{photos.length} fotografia(s) guardada(s) na nuvem</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>cameraRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Camera size={17}/> Câmara</button><button onClick={()=>inputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"><Plus size={18}/> Adicionar fotografias</button><input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e:ChangeEvent<HTMLInputElement>)=>void uploadFiles(e.target.files)}/><input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e:ChangeEvent<HTMLInputElement>)=>void uploadFiles(e.target.files)}/></div></div>
 {uploading&&<div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700"><div className="flex items-center gap-2"><Upload size={17}/>{progress||"A preparar upload..."}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600"/></div></div>}
 {!uploading&&progress&&<p className="mt-5 text-sm text-emerald-700">{progress}</p>}{error&&<div role="alert" className="mt-5 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={()=>setError("")}><X size={16}/></button></div>}
 <div className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search size={18} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar fotografias..." className="w-full bg-transparent text-sm outline-none"/></div>
 {loading?<div className="mt-8" role="status" aria-live="polite"><div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Cloud size={21}/><span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-60"/></span><div><p className="text-sm font-semibold text-slate-800">A preparar o teu espaço...</p><p className="mt-0.5 text-xs text-slate-500">A carregar as tuas fotografias em segurança</p></div><span className="ml-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"/></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({length:8},(_,i)=><div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-square animate-pulse bg-slate-100"/><div className="space-y-2 p-3"><div className="h-3 w-3/4 animate-pulse rounded bg-slate-100"/><div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100"/></div></div>)}</div></div>:filtered.length===0?<div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Images size={28}/></span><h2 className="mt-5 text-xl font-semibold">{query?"Nenhum resultado":"A tua galeria está vazia"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{query?"Experimenta pesquisar por outro nome.":"Adiciona fotografias da galeria do teu dispositivo ou tira uma fotografia com a câmara."}</p>{!query&&<button onClick={()=>inputRef.current?.click()} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Adicionar primeira fotografia</button>}</div>:<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filtered.map(photo=><article key={photo.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative aspect-square bg-slate-100">{urls[photo.id]?<img src={urls[photo.id]} alt={photo.original_name} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-slate-400">A preparar...</div>}<div className="absolute inset-x-2 bottom-2 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100"><button aria-label="Descarregar fotografia" onClick={()=>void downloadPhoto(photo)} className="rounded-lg bg-white/95 p-2 text-slate-700 shadow"><Download size={16}/></button><button aria-label="Apagar fotografia" onClick={()=>void removePhoto(photo)} className="rounded-lg bg-white/95 p-2 text-red-600 shadow"><Trash2 size={16}/></button></div></div><div className="p-3"><p className="truncate text-sm font-medium text-slate-800">{photo.original_name}</p><p className="mt-1 text-xs text-slate-400">{(photo.size_bytes/1024/1024).toFixed(2)} MB · {new Date(photo.created_at).toLocaleDateString("pt-PT")}</p></div></article>)}</div>}
 </section></main>;
}