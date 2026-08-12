"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatError } from "@/lib/error-formatter";
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const passwordStrong = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!passwordStrong) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Account created! Logging you in...");
      const loginRes = await api.post("/auth/login", { email, password });
      const { accessToken, user } = loginRes.data.data;
      login(accessToken, user);
      router.push("/dashboard");
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
              Join your team and start managing projects with full role-based access control.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs mt-4">
            {[
              "Secure role-based permissions",
              "Project & task tracking",
              "Complete audit trail",
            ].map((f) => (
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email address</label>
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {password.length > 0 && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center ${passwordStrong ? "text-green-500" : "text-destructive"}`}>
                    {passwordStrong ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">!</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {confirmPassword.length > 0 && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center ${passwordsMatch ? "text-green-500" : "text-destructive"}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">!</span>}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
