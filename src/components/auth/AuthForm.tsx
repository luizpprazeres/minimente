"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = loginSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
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
          if (authError.message.includes("Invalid login credentials")) {
            setError("Invalid email or password");
          } else {
            setError(authError.message);
          }
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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) {
          if (authError.message.includes("already registered")) {
            setError("Email already in use");
          } else {
            setError(authError.message);
          }
          return;
        }
        setMessage("Check your email for a confirmation link.");
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: `${window.location.origin}/auth/update-password` }
        );
        if (authError) {
          setError(authError.message);
          return;
        }
        setMessage("Password reset email sent. Check your inbox.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  const titles: Record<AuthMode, string> = {
    login: "Sign in to your account",
    signup: "Create your account",
    reset: "Reset your password",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-800">{titles[mode]}</h1>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
          Email address
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
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      {mode !== "reset" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/auth/reset-password"
                className="text-xs text-cinnamon-500 hover:text-cinnamon-600"
              >
                Forgot password?
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
            placeholder="••••••••"
          />
        </div>
      )}

      {/* Inline error */}
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
      {message && (
        <p className="text-sm text-success font-medium">{message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-xl bg-cinnamon-500 py-2.5 text-sm font-semibold text-white",
          "hover:bg-cinnamon-600 focus:ring-2 focus:ring-cinnamon-500 focus:ring-offset-2",
          "transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {loading
          ? "Please wait…"
          : mode === "login"
          ? "Sign In"
          : mode === "signup"
          ? "Create Account"
          : "Send Reset Email"}
      </button>

      {/* Google OAuth — login/signup only */}
      {mode !== "reset" && (
        <>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-xs text-neutral-400">or</span>
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
            Continue with Google
          </button>
        </>
      )}

      {/* Footer link */}
      <p className="text-center text-sm text-neutral-500">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-cinnamon-500 font-medium hover:text-cinnamon-600">
              Sign up
            </Link>
          </>
        ) : mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cinnamon-500 font-medium hover:text-cinnamon-600">
              Sign in
            </Link>
          </>
        ) : (
          <Link href="/auth/login" className="text-cinnamon-500 font-medium hover:text-cinnamon-600">
            Back to sign in
          </Link>
        )}
      </p>
    </form>
  );
}
