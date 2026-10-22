"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/forms/phone-input";
import { PasswordInput } from "@/components/forms/password-input";
import { FormField } from "@/components/forms/form-field";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";

type Step = "phone" | "password" | "done";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPhone = searchParams.get("phone") ?? "";

  const [step, setStep] = React.useState<Step>(prefillPhone ? "password" : "phone");
  const [phone, setPhone] = React.useState(prefillPhone);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.password?.[0] || json.error || "Failed to set password");
        return;
      }

      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setLoading(true);
    const result = await signIn("credentials", {
      identifier: phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Auto-login failed. Please sign in manually.");
      setLoading(false);
      return;
    }

    router.push("/patient/dashboard");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set your password</CardTitle>
        <CardDescription>
          {step === "phone" && "Enter your phone number to get started"}
          {step === "password" && "Create a secure password for your account"}
          {step === "done" && "Your password has been set successfully"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (phone) setStep("password");
            }}
            className="space-y-4"
          >
            <PhoneInput value={phone} onChange={setPhone} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={!phone}>
              Continue
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              {phone}
            </div>
            <PasswordInput
              label="New Password"
              value={password}
              onChange={setPassword}
              required
            />
            <FormField label="Confirm Password" htmlFor="confirm-password" required>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Password
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Your password has been set. You can now sign in.
            </p>
            <Button onClick={handleAutoLogin} className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </div>
        )}

        {step !== "done" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Set your password</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
