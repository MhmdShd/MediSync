"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Loader2, CheckCircle } from "lucide-react";

interface DoctorProfile {
  name: string;
  phone: string;
  username: string | null;
  email: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  bio: string | null;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = React.useState<DoctorProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    name: string;
    specialization: string;
    licenseNumber: string;
    bio: string;
  }>();

  React.useEffect(() => {
    fetch("/api/doctors/me/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.doctor) {
          setProfile(data.doctor);
          reset({
            name: data.doctor.name ?? "",
            specialization: data.doctor.specialization ?? "",
            licenseNumber: data.doctor.licenseNumber ?? "",
            bio: data.doctor.bio ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: { name: string; specialization: string; licenseNumber: string; bio: string }) => {
    setError(null);
    const res = await fetch("/api/doctors/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name || undefined,
        specialization: data.specialization || undefined,
        licenseNumber: data.licenseNumber || undefined,
        bio: data.bio || undefined,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to save profile");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Doctor profile not found.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{profile.phone}</span>
          </div>
          {profile.username && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span>{profile.username}</span>
            </div>
          )}
          {profile.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{profile.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full Name" htmlFor="name">
              <Input id="name" {...register("name")} placeholder="Dr. Ahmed Ali" />
            </FormField>
            <FormField label="Specialization" htmlFor="specialization">
              <Input id="specialization" {...register("specialization")} placeholder="Internal Medicine" />
            </FormField>
            <FormField label="License Number" htmlFor="licenseNumber">
              <Input id="licenseNumber" {...register("licenseNumber")} placeholder="LIC-12345" />
            </FormField>
            <FormField label="Bio" htmlFor="bio">
              <textarea
                id="bio"
                {...register("bio")}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Short professional bio..."
              />
            </FormField>

            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Profile saved!</span>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
