import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuração administrativa do Supabase em falta.");
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  try {
    const sessionClient = await createClient();
    const { data: { user }, error } = await sessionClient.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Inicia sessão novamente." }, { status: 401 });

    const admin = adminClient();
    const { data: shares, error: sharesError } = await admin
      .from("file_shares").select("id, sender_id, photo_id, created_at")
      .eq("recipient_id", user.id).order("created_at", { ascending: false });
    if (sharesError) throw sharesError;
    const photoIds = [...new Set((shares ?? []).map(item => item.photo_id))];
    if (!photoIds.length) return NextResponse.json({ shares: [] });

    const [{ data: photos, error: photosError }, { data: senders, error: sendersError }] = await Promise.all([
      admin.from("photos").select("id, original_name, mime_type, size_bytes, created_at").in("id", photoIds).is("deleted_at", null),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    ]);
    if (photosError) throw photosError;
    if (sendersError) throw sendersError;

    const photoById = new Map((photos ?? []).map(photo => [photo.id, photo]));
    const userById = new Map((senders.users ?? []).map(sender => [sender.id, sender.email ?? "Utilizador APCLOUD"]));
    const result = (shares ?? []).flatMap(share => {
      const photo = photoById.get(share.photo_id);
      return photo ? [{ id: share.id, created_at: share.created_at, file: photo, sender_email: userById.get(share.sender_id) ?? "Utilizador APCLOUD" }] : [];
    });
    return NextResponse.json({ shares: result });
  } catch (error) {
    console.error("APCLOUD list received shares:", error);
    return NextResponse.json({ error: "Não foi possível carregar os ficheiros partilhados contigo." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, photoId } = await request.json();
    const recipientEmail = typeof email === "string" ? email.trim() : "";
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(recipientEmail) || recipientEmail.length > 254 || typeof photoId !== "string") {
      return NextResponse.json({ error: "Indica o e-mail do utilizador e selecciona um ficheiro válido." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Inicia sessão novamente." }, { status: 401 });

    const { data: matches, error: lookupError } = await supabase.rpc("lookup_apcloud_user_by_email", { lookup_email: recipientEmail });
    if (lookupError) throw lookupError;
    const recipient = Array.isArray(matches) ? matches[0] : null;
    if (!recipient) return NextResponse.json({ error: "Não encontrámos uma conta APCLOUD com esse e-mail." }, { status: 404 });
    if (recipient.user_id === user.id) return NextResponse.json({ error: "Não podes partilhar um ficheiro contigo próprio." }, { status: 400 });

    const { data: share, error: insertError } = await supabase.from("file_shares")
      .insert({ sender_id: user.id, recipient_id: recipient.user_id, photo_id: photoId })
      .select("id").single();
    if (insertError) {
      if (insertError.code === "23505") return NextResponse.json({ error: "Este ficheiro já foi partilhado com esse utilizador." }, { status: 409 });
      throw insertError;
    }
    return NextResponse.json({ success: true, shareId: share.id });
  } catch (error) {
    console.error("APCLOUD direct share:", error);
    return NextResponse.json({ error: "Não foi possível partilhar o ficheiro com essa conta." }, { status: 500 });
  }
}
