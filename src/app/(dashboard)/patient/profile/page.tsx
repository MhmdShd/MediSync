"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { updatePatientSchema, type UpdatePatientInput } from "@/lib/validations/patient";
import { Loader2, CheckCircle } from "lucide-react";

interface UserData {
  id: string;
  phone: string;
  username: string | null;
}

export default function PatientProfilePage() {
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [username, setUsername] = React.useState("");
  const [accountSaved, setAccountSaved] = React.useState(false);
  const [accountError, setAccountError] = React.useState<string | null>(null);
  const [accountSaving, setAccountSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserData(data.user);
          setUsername(data.user.username ?? "");
        }
      });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePatientInput>({
    resolver: zodResolver(updatePatientSchema),
  });

  const onSubmit = async (data: UpdatePatientInput) => {
    if (!userData) return;
    setError(null);
    const res = await fetch(`/api/patients/${userData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to save profile");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveAccount = async () => {
    setAccountSaving(true);
    setAccountError(null);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username || null }),
    });

    if (!res.ok) {
      const json = await res.json();
      setAccountError(json.error || "Failed to save");
      setAccountSaving(false);
      return;
    }

    setAccountSaved(true);
    setAccountSaving(false);
    setTimeout(() => setAccountSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Phone: </span>
            <span className="font-medium">{userData?.phone ?? "—"}</span>
          </div>
          <FormField label="Username" htmlFor="username">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Set a username for easier login"
            />
          </FormField>
          {accountSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Saved!</span>
            </div>
          )}
          {accountError && <p className="text-sm text-destructive">{accountError}</p>}
          <Button onClick={handleSaveAccount} disabled={accountSaving} size="sm">
            {accountSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Username
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full Name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" {...register("name")} placeholder="Your name" />
            </FormField>
            <FormField label="Date of Birth" htmlFor="dob">
              <Input id="dob" type="date" {...register("dateOfBirth")} />
            </FormField>
            <FormField label="Address" htmlFor="address">
              <Input id="address" {...register("address")} placeholder="Your address" />
            </FormField>
            <FormField label="Emergency Contact" htmlFor="emergency">
              <Input id="emergency" {...register("emergencyContact")} placeholder="+9641234567890" />
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
