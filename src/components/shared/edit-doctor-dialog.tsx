"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/forms/form-field";
import { Loader2 } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  phone: string;
  specialization: string | null;
  role: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  clinicId: string;
  onUpdated: () => void;
}

export function EditDoctorDialog({ open, onOpenChange, doctor, clinicId, onUpdated }: Props) {
  const [specialization, setSpecialization] = useState("");
  const [role, setRole] = useState("ATTENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (doctor) {
      setSpecialization(doctor.specialization ?? "");
      setRole(doctor.role);
      setError("");
    }
  }, [doctor]);

  const handleSave = async () => {
    if (!doctor) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/clinics/${clinicId}/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization: specialization || undefined, role }),
      });
      if (res.ok) {
        onOpenChange(false);
        onUpdated();
      } else {
        const d = await res.json();
        setError(d.error ?? "Update failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{doctor.name}</p>
          </div>
          <div className="text-sm">
            <Label className="text-muted-foreground">Phone</Label>
            <p className="font-medium">{doctor.phone}</p>
          </div>
          <FormField label="Specialization" htmlFor="edit-spec">
            <Input
              id="edit-spec"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Internal Medicine"
            />
          </FormField>
          <div className="space-y-2">
            <Label>Role in Clinic</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ATTENDING">Attending</option>
              <option value="CONSULTANT">Consultant</option>
              <option value="VISITING">Visiting</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
