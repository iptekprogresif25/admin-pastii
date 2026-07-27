import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = searchParams_get(requestUrl, "code");
  const next = "/admin";

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user is active and has ADMIN role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "ADMIN" || profile.is_active === false) {
        // Sign out if not allowed
        await supabase.auth.signOut();
        let errorMessage = "Akses ditolak.";
        if (!profile) errorMessage = "Profil tidak ditemukan.";
        else if (profile.role !== "ADMIN") errorMessage = "Anda bukan Administrator.";
        else if (profile.is_active === false) errorMessage = "Akun Anda dinonaktifkan.";
        
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorMessage)}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent("Gagal masuk dengan OAuth.")}`);
}

function searchParams_get(url: URL, param: string) {
  return url.searchParams.get(param);
}
