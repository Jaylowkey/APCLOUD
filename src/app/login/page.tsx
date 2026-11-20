"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Cloud, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace("/gallery"); router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message.toLowerCase() : "";
      if (message.includes("invalid login credentials")) setError("Email ou palavra-passe incorretos. Confirma os teus dados e tenta novamente.");
      else if (message.includes("email not confirmed")) setError("Ainda falta confirmar o teu email. Introduz o código enviado para a tua caixa de entrada.");
      else if (message.includes("too many requests")) setError("Foram feitas demasiadas tentativas. Aguarda alguns minutos e tenta novamente.");
      else if (message.includes("network") || message.includes("fetch")) setError("Não foi possível ligar ao servidor. Verifica a tua ligação à internet.");
      else setError("Não foi possível iniciar sessão. Verifica os dados e tenta novamente.");
    } finally { setBusy(false); }
  }

  return <main className="login-shell">
    <section className="login-story">
      <div className="login-story-glow login-story-glow-one" />
      <div className="login-story-glow login-story-glow-two" />
      <Link href="/" className="brand-lockup login-brand"><span className="brand-mark"><Cloud size={21}/></span><span className="brand-name login-brand-name">AP<span>CLOUD</span></span></Link>
      <div className="login-story-copy">
        <span className="login-kicker"><Sparkles size={14}/> O teu arquivo pessoal</span>
        <h1>Volta a entrar no teu <em>espaço.</em></h1>
        <p>As tuas fotografias, ficheiros e momentos importantes ficam organizados, privados e sempre à mão.</p>
        <div className="login-proof-list"><span><i><Check size={13}/></i> Privacidade por defeito</span><span><i><Check size={13}/></i> Acesso em qualquer dispositivo</span><span><i><Check size={13}/></i> Partilha quando quiseres</span></div>
      </div>
      <div className="login-story-footer"><span className="login-orbit orbit-a"/><span className="login-orbit orbit-b"/><span>APCLOUD <b>·</b> Guarda o que importa</span><span className="login-secure"><LockKeyhole size={13}/> Ligação segura</span></div>
    </section>
    <section className="login-panel">
      <Link href="/" className="brand-lockup login-mobile-brand"><span className="brand-mark small"><Cloud size={18}/></span><span className="brand-name">AP<span>CLOUD</span></span></Link>
      <div className="login-card">
        <div className="login-card-top"><span className="login-icon"><LockKeyhole size={21}/></span><span className="login-status"><span/> Espaço privado</span></div>
        <p className="login-eyebrow">Bem-vindo de volta</p>
        <h2>Entrar na tua conta</h2>
        <p className="login-intro">Continua exactamente de onde ficaste.</p>
        <form onSubmit={submit} className="login-form">
          <label className="login-field"><span>Email</span><input required type="email" autoComplete="email" placeholder="tu@exemplo.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
          <label className="login-field"><span>Palavra-passe</span><span className="login-password"><input required type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Introduz a tua palavra-passe" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
          <div className="login-form-meta"><span><LockKeyhole size={13}/> Os teus dados ficam privados</span><Link href="/forgot-password">Esqueci-me da palavra-passe</Link></div>
          {error && <p role="alert" className="login-error">{error}</p>}
          <button disabled={busy} className="login-submit">{busy ? "A entrar..." : "Entrar na APCLOUD"}<ArrowRight size={18}/></button>
        </form>
        <p className="login-signup">Ainda não tens conta? <Link href="/signup">Criar conta grátis</Link></p>
      </div>
      <p className="login-panel-note">Ao entrar, aceitas manter o teu espaço seguro e privado.</p>
    </section>
  </main>;
}
