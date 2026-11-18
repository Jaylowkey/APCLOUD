import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Inicia sessão novamente." }, { status: 401 });

    const { data: share, error: shareError } = await supabase
      .from("file_shares").select("id, photo_id").eq("id", id).eq("recipient_id", user.id).maybeSingle();
    if (shareError || !share) return NextResponse.json({ error: "Este ficheiro não foi partilhado contigo ou já não está disponível." }, { status: 404 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Configuração administrativa do Supabase em falta.");
    const admin = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: photo, error: photoError } = await admin.from("photos")
      .select("storage_path, original_name, mime_type, size_bytes")
      .eq("id", share.photo_id).is("deleted_at", null).maybeSingle();
    if (photoError || !photo) return NextResponse.json({ error: "O proprietário já não disponibiliza este ficheiro." }, { status: 404 });

    const { data: signed, error: signedError } = await admin.storage.from("photos").createSignedUrl(photo.storage_path, 300);
    if (signedError || !signed?.signedUrl) throw signedError ?? new Error("Não foi possível abrir o ficheiro.");
    return NextResponse.json({ file: { name: photo.original_name, type: photo.mime_type, size: photo.size_bytes, url: signed.signedUrl } });
  } catch (error) {
    console.error("APCLOUD open internal share:", error);
    return NextResponse.json({ error: "Não foi possível abrir este ficheiro." }, { status: 500 });
  }
}
