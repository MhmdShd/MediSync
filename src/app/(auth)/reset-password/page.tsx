"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/forms/phone-input";
import { PasswordInput } from "@/components/forms/password-input";
import { FormField } from "@/components/forms/form-field";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";

type Step = "phone" | "code" | "done";

export default function ResetPasswordPage() {
  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setStep("code");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Invalid code");
        return;
      }
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          {step === "phone" && "Enter your phone number to receive a reset code"}
          {step === "code" && "Enter the code sent to your phone"}
          {step === "done" && "Password reset successful"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <PhoneInput value={phone} onChange={setPhone} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset code
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <FormField label="Verification Code" htmlFor="code" required>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </FormField>
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset password
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Sign in with new password</Link>
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
