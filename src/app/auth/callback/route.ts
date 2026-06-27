import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = "/admin";

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

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent("Gagal masuk dengan OAuth.")}`);
}
