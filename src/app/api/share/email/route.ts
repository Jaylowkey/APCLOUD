import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char] ?? char);
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    const recipient = typeof email === "string" ? email.trim() : "";
    const shareToken = typeof token === "string" ? token.trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || recipient.length > 254) {
      return NextResponse.json({ error: "Indica um endereço de e-mail válido." }, { status: 400 });
    }
    if (!/^[a-f0-9-]{20,}$/i.test(shareToken)) {
      return NextResponse.json({ error: "Link de partilha inválido." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      return NextResponse.json({ error: "O envio de e-mail ainda não está configurado. Contacta o administrador." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Inicia sessão novamente." }, { status: 401 });
    }

    const { data: share, error: shareError } = await supabase
      .from("photo_shares")
      .select("token, expires_at, photo_id")
      .eq("token", shareToken)
      .eq("user_id", user.id)
      .maybeSingle();

    if (shareError || !share || new Date(share.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Esta partilha não existe ou já expirou." }, { status: 404 });
    }

    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .select("original_name, deleted_at")
      .eq("id", share.photo_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (photoError || !photo || photo.deleted_at) {
      return NextResponse.json({ error: "O ficheiro já não está disponível." }, { status: 404 });
    }

    const shareUrl = new URL("/share/" + encodeURIComponent(share.token), request.url).toString();
    const fileName = escapeHtml(photo.original_name);
    const expiry = new Date(share.expires_at).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: "Foi partilhado um ficheiro contigo — APCLOUD",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033;line-height:1.6"><h2 style="color:#2455e8">APCLOUD</h2><p>Olá,</p><p>Foi partilhado contigo o ficheiro <strong>${fileName}</strong>.</p><p style="margin:28px 0"><a href="${shareUrl}" style="background:#2455e8;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;display:inline-block">Abrir ficheiro</a></p><p>Este link é válido até <strong>${escapeHtml(expiry)}</strong>.</p><p style="font-size:12px;color:#64748b">Se não estavas à espera deste e-mail, podes ignorá-lo.</p></div>`
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("APCLOUD Resend error:", response.status, detail);
      return NextResponse.json({ error: "O serviço de e-mail não conseguiu enviar a mensagem. Tenta novamente." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("APCLOUD email share:", error);
    return NextResponse.json({ error: "Não foi possível enviar o e-mail." }, { status: 500 });
  }
}
