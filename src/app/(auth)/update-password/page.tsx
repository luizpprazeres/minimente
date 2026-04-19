"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-800">Set new password</h1>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-cinnamon-500 focus:border-transparent"
          )}
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-error font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-cinnamon-500 py-2.5 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors disabled:opacity-60"
      >
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
