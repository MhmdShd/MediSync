"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import Link from "next/link";
import { Loader2, Stethoscope, LogIn, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);

    if (data.identifier.startsWith("+")) {
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.identifier }),
      });
      const checkData = await checkRes.json();

      if (checkData.needsPassword) {
        router.push(`/set-password?phone=${encodeURIComponent(data.identifier)}`);
        return;
      }
    }

    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    const role = meData.user?.role;

    if (role === "CLINIC_ADMIN") router.push("/clinic");
    else if (role === "DOCTOR") router.push("/doctor/dashboard");
    else if (role === "PATIENT") router.push("/patient/dashboard");
    else router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="relative overflow-hidden rounded-2xl border border-input bg-card"
        style={{ boxShadow: "0 8px 28px rgba(1, 93, 103, 0.10)" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-primary" />

        <div className="p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight">MediSync</h2>
            </div>
            <p className="text-sm text-muted-foreground">Sign in to access the platform</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-destructive/5 text-destructive border border-destructive/15">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0" noValidate>
            {/* Username */}
            <div className="mb-5">
              <label htmlFor="identifier" className="block mb-2 text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  {...register("identifier")}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-input bg-background text-sm transition focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {errors.identifier?.message && (
                <p className="text-xs text-destructive mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-input bg-background text-sm transition focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:bg-muted transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In button */}
            <Button
              type="submit"
              className="w-full py-3 h-auto rounded-full text-sm font-medium flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Sign In
            </Button>
          </form>

          {/* Links */}
          <div className="mt-5 flex flex-col gap-2 text-center text-sm">
            <Link href="/reset-password" className="text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </Link>
            <span className="text-muted-foreground">
              New clinic?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </span>
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-6 text-muted-foreground">
            Secure access for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
