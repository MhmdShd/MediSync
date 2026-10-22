"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { PhoneInput } from "@/components/forms/phone-input";
import { updateClinicSchema } from "@/lib/validations/clinic";
import { Loader2, CheckCircle } from "lucide-react";

interface ClinicData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  timezone: string;
}

export default function ClinicSettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clinic, setClinic] = React.useState<ClinicData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(updateClinicSchema),
  });

  React.useEffect(() => {
    fetch("/api/clinics")
      .then((r) => r.json())
      .then((data) => {
        const clinics = data.clinics ?? [];
        if (clinics.length > 0) {
          const c = clinics[0];
          setClinic(c);
          reset({
            name: c.name,
            address: c.address,
            phone: c.phone,
            email: c.email ?? "",
            timezone: c.timezone,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setError(null);

    if (clinic) {
      const res = await fetch(`/api/clinics/${clinic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.name?.[0] || json.error || "Failed to save clinic");
        return;
      }
    } else {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          operatingHours: {
            mon: { open: "09:00", close: "17:00" },
            tue: { open: "09:00", close: "17:00" },
            wed: { open: "09:00", close: "17:00" },
            thu: { open: "09:00", close: "17:00" },
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.name?.[0] || json.error || "Failed to save clinic");
        return;
      }
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.refresh();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{clinic ? "Clinic Settings" : "Clinic Setup"}</h1>
        <p className="text-muted-foreground">
          {clinic ? "Update your clinic profile" : "Configure your clinic profile"}
        </p>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
          <CardDescription>This information will appear on your clinic&apos;s profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Clinic Name" htmlFor="name" error={errors.name?.message as string} required>
              <Input id="name" {...register("name")} placeholder="Al-Noor Clinic" />
            </FormField>

            <FormField label="Address" htmlFor="address" error={errors.address?.message as string} required>
              <Input id="address" {...register("address")} placeholder="123 Main St, Baghdad" />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <PhoneInput
                id="phone"
                value={watch("phone") ?? ""}
                onChange={(v) => setValue("phone", v, { shouldValidate: true })}
                error={errors.phone?.message as string}
                required
              />

              <FormField label="Email" htmlFor="email" error={errors.email?.message as string}>
                <Input id="email" type="email" {...register("email")} placeholder="info@clinic.iq" />
              </FormField>
            </div>

            <FormField label="Timezone" htmlFor="timezone">
              <Input id="timezone" {...register("timezone")} placeholder="Asia/Baghdad" />
            </FormField>

            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Settings saved!</span>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting || saved}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {clinic ? "Save Changes" : "Create Clinic"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
