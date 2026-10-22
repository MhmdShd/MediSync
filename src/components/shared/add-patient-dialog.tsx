"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneLookupInput } from "./phone-lookup-input";
import { FormField } from "@/components/forms/form-field";
import { UserPlus } from "lucide-react";

interface AddPatientDialogProps {
  clinicId: string;
  onPatientAdded: () => void;
}

type Mode = "lookup" | "create";

export function AddPatientDialog({ clinicId, onPatientAdded }: AddPatientDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("lookup");
  const [newPhone, setNewPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async (phone: string) => {
    const res = await fetch(`/api/clinics/${clinicId}/patients/search?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    return data.results ?? [];
  };

  const handleLink = async (result: { id: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", patientId: result.id }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to link patient");
        return;
      }
      setOpen(false);
      onPatientAdded();
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          phone: newPhone,
          name,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to create patient");
        return;
      }
      setOpen(false);
      onPatientAdded();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMode("lookup");
    setNewPhone("");
    setName("");
    setDateOfBirth("");
    setGender("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient</DialogTitle>
        </DialogHeader>

        {mode === "lookup" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Search by phone number to find an existing patient profile.
            </p>
            <PhoneLookupInput
              onSearch={handleSearch}
              onSelect={handleLink}
              onCreateNew={(phone) => { setNewPhone(phone); setMode("create"); }}
            />
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No existing profile found. Create a new patient profile.
            </p>
            <FormField label="Phone" htmlFor="patient-phone">
              <Input id="patient-phone" value={newPhone} readOnly />
            </FormField>
            <FormField label="Full Name" htmlFor="patient-name" required>
              <Input id="patient-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ali Hassan" required />
            </FormField>
            <FormField label="Date of Birth" htmlFor="dob">
              <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </FormField>
            <FormField label="Gender" htmlFor="gender">
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("lookup")}>Back</Button>
              <Button type="submit" disabled={loading || !name}>Create Patient</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
