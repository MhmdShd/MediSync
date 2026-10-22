"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/forms/phone-input";
import { PasswordInput } from "@/components/forms/password-input";
import { FormField } from "@/components/forms/form-field";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: "", username: "", password: "", name: "", role: "CLINIC_ADMIN", clinicName: "", clinicAddress: "", clinicPhone: "" },
  });

  const phone = watch("phone");
  const password = watch("password");
  const clinicName = watch("clinicName");
  const clinicAddress = watch("clinicAddress");
  const clinicPhone = watch("clinicPhone");

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.phone?.[0] || json.error || "Registration failed");
      return;
    }

    // Auto-login after registration
    await signIn("credentials", {
      identifier: data.phone,
      password: data.password,
      redirect: false,
    });

    router.push("/clinic");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Register as a clinic administrator</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full Name" htmlFor="name" error={errors.name?.message} required>
            <Input
              id="name"
              {...register("name")}
              placeholder="Dr. Ahmed Al-Rashid"
              aria-invalid={!!errors.name}
            />
          </FormField>

          <PhoneInput
            value={phone}
            onChange={(v) => setValue("phone", v)}
            error={errors.phone?.message}
            required
          />

          <FormField label="Username" htmlFor="username" error={errors.username?.message}>
            <Input
              id="username"
              {...register("username")}
              placeholder="optional_username"
              autoComplete="username"
            />
          </FormField>

          <PasswordInput
            value={password}
            onChange={(v) => setValue("password", v)}
            error={errors.password?.message}
            required
          />

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Clinic Information</p>
            <div className="space-y-3">
              <FormField label="Clinic Name" htmlFor="clinicName" error={errors.clinicName?.message} required>
                <Input
                  id="clinicName"
                  value={clinicName}
                  onChange={(e) => setValue("clinicName", e.target.value)}
                  placeholder="Al-Noor Clinic"
                  required
                />
              </FormField>
              <FormField label="Clinic Address" htmlFor="clinicAddress" error={errors.clinicAddress?.message} required>
                <Input
                  id="clinicAddress"
                  value={clinicAddress}
                  onChange={(e) => setValue("clinicAddress", e.target.value)}
                  placeholder="123 Al-Mansour St, Baghdad"
                  required
                />
              </FormField>
              <FormField label="Clinic Phone" htmlFor="clinicPhone" error={errors.clinicPhone?.message}>
                <Input
                  id="clinicPhone"
                  value={clinicPhone}
                  onChange={(e) => setValue("clinicPhone", e.target.value)}
                  placeholder="+96414001234"
                />
              </FormField>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 rounded-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
