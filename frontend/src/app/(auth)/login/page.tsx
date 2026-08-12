"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatError } from "@/lib/error-formatter";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data.data;
      login(accessToken, user);
      toast.success("Welcome back!");
      router.push(redirectPath);
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-[oklch(0.10_0.015_250)]">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[oklch(0.65_0.24_250)] opacity-[0.07] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[oklch(0.60_0.15_200)] opacity-[0.07] blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
              RBAC Tracker
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              Role-based project & task management built for modern teams.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs mt-4">
            {["Role-based access control", "Real-time audit logs", "Team collaboration"].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">RBAC Tracker</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
