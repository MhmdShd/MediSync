"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneLookupInput } from "./phone-lookup-input";
import { FormField } from "@/components/forms/form-field";
import { UserPlus } from "lucide-react";

interface AddDoctorDialogProps {
  clinicId: string;
  onDoctorAdded: () => void;
}

type Mode = "lookup" | "create";

export function AddDoctorDialog({ clinicId, onDoctorAdded }: AddDoctorDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("lookup");
  const [newPhone, setNewPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async (phone: string) => {
    const res = await fetch(`/api/clinics/${clinicId}/doctors/search?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    return data.results ?? [];
  };

  const handleLink = async (result: { id: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", doctorId: result.id }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to link doctor");
        return;
      }
      setOpen(false);
      onDoctorAdded();
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", phone: newPhone, name, specialization: specialization || undefined }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to create doctor");
        return;
      }
      setOpen(false);
      onDoctorAdded();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMode("lookup");
    setNewPhone("");
    setName("");
    setSpecialization("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Doctor to Clinic</DialogTitle>
        </DialogHeader>

        {mode === "lookup" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Search by phone number to find an existing doctor profile.
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
              No existing profile found. Create a new doctor profile.
            </p>
            <FormField label="Phone" htmlFor="new-phone">
              <Input id="new-phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} readOnly />
            </FormField>
            <FormField label="Full Name" htmlFor="doctor-name" required>
              <Input id="doctor-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ahmed Ali" required />
            </FormField>
            <FormField label="Specialization" htmlFor="specialization">
              <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Internal Medicine" />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("lookup")}>Back</Button>
              <Button type="submit" disabled={loading || !name}>Create &amp; Invite</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
