"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { authCopy } from "@/lib/copy";

// B4 fix: use env var instead of window.location.origin
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const loginSchema = z.object({
  email: z.string().email(authCopy.validationEmail.en),
  password: z.string().min(8, authCopy.validationPassword.en),
});

const signupSchema = loginSchema.extend({
  password: z.string().min(8, authCopy.validationPassword.en),
});

type AuthMode = "login" | "signup" | "reset";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          setError(result.error.errors[0].message);
          return;
        }
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(
            authError.message.includes("Invalid login credentials")
              ? authCopy.login.errInvalid.en
              : authError.message
          );
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } else if (mode === "signup") {
        const result = signupSchema.safeParse({ email, password });
        if (!result.success) {
          setError(result.error.errors[0].message);
          return;
        }
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${APP_URL}/auth/callback`,
          },
        });
        if (authError) {
          setError(
            authError.message.includes("already registered")
              ? authCopy.signup.errInUse.en
              : authError.message
          );
          return;
        }
        setEmail("");
        setPassword("");
        setMessage(authCopy.signup.successMsg.en);
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: `${APP_URL}/auth/update-password` }
        );
        if (authError) {
          setError(authError.message);
          return;
        }
        setMessage(authCopy.reset.successMsg.en);
      }
    } catch {
      setError(authCopy.errGeneric.en);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
  }

  const titles: Record<AuthMode, string> = {
    login: authCopy.login.title.en,
    signup: authCopy.signup.title.en,
    reset: authCopy.reset.title.en,
  };

  const submitLabels: Record<AuthMode, string> = {
    login: authCopy.login.submitBtn.en,
    signup: authCopy.signup.submitBtn.en,
    reset: authCopy.reset.submitBtn.en,
  };

  const loadingLabels: Record<AuthMode, string> = {
    login: authCopy.login.loadingBtn.en,
    signup: authCopy.signup.loadingBtn.en,
    reset: authCopy.reset.loadingBtn.en,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-800">{titles[mode]}</h1>

      {/* Description for reset */}
      {mode === "reset" && (
        <p className="text-sm text-neutral-500">{authCopy.reset.desc.en}</p>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {authCopy.login.emailLabel.en}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-cinnamon-500 focus:border-transparent",
            "placeholder:text-neutral-400 bg-white"
          )}
          placeholder={authCopy.login.emailPlaceholder.en}
        />
      </div>

      {/* Password */}
      {mode !== "reset" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              {authCopy.login.passwordLabel.en}
            </label>
            {mode === "login" && (
              <Link
                href="/reset-password"
                className="text-xs text-cinnamon-500 hover:text-cinnamon-600"
              >
                {authCopy.login.forgotLink.en}
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-cinnamon-500 focus:border-transparent",
              "placeholder:text-neutral-400 bg-white"
            )}
            placeholder={authCopy.login.passwordPlaceholder.en}
          />
        </div>
      )}

      {/* B1 fix: use explicit Tailwind colors (not semantic vars that may not be scanned) */}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      {message && (
        <p className="text-sm text-green-700 font-medium">{message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-xl bg-cinnamon-500 py-2.5 text-sm font-semibold text-white",
          "hover:bg-cinnamon-600 focus:ring-2 focus:ring-cinnamon-500 focus:ring-offset-2",
          "transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-400"
        )}
      >
        {loading ? loadingLabels[mode] : submitLabels[mode]}
      </button>

      {/* Google OAuth — login/signup only */}
      {mode !== "reset" && (
        <>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-xs text-neutral-400">
              {authCopy.login.divider.en}
            </span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-300",
              "py-2.5 text-sm font-medium text-neutral-700 bg-white",
              "hover:bg-neutral-50 transition-colors"
            )}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {authCopy.login.googleBtn.en}
          </button>
        </>
      )}

      {/* Footer link */}
      <p className="text-center text-sm text-neutral-500">
        {mode === "login" ? (
          <>
            {authCopy.login.footerText.en}{" "}
            <Link
              href="/signup"
              className="text-cinnamon-500 font-medium hover:text-cinnamon-600"
            >
              {authCopy.login.footerLink.en}
            </Link>
          </>
        ) : mode === "signup" ? (
          <>
            {authCopy.signup.footerText.en}{" "}
            <Link
              href="/login"
              className="text-cinnamon-500 font-medium hover:text-cinnamon-600"
            >
              {authCopy.signup.footerLink.en}
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="text-cinnamon-500 font-medium hover:text-cinnamon-600"
          >
            {authCopy.reset.backLink.en}
          </Link>
        )}
      </p>
    </form>
  );
}
