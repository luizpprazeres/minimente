import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if onboarding is complete — use raw query to avoid type issues
      const { data: profileRaw } = await supabase
        .from("user_profiles")
        .select("onboarding_done")
        .eq("user_id", data.user.id)
        .single();

      const profile = profileRaw as { onboarding_done: boolean } | null;

      if (profile && !profile.onboarding_done) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
