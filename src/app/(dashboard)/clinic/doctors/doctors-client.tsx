"use client";

import * as React from "react";
import { AddDoctorDialog } from "@/components/shared/add-doctor-dialog";
import { EditDoctorDialog } from "@/components/shared/edit-doctor-dialog";
import { DoctorAvailabilityDialog } from "@/components/shared/doctor-availability-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  phone: string;
  specialization: string | null;
  avatarUrl: string | null;
  role: string;
  joinedAt: string;
}

interface DoctorsClientProps {
  clinicId: string;
  clinicName: string;
  initialDoctors: Doctor[];
}

export function DoctorsClient({ clinicId, clinicName, initialDoctors }: DoctorsClientProps) {
  const router = useRouter();
  const [editDoctor, setEditDoctor] = React.useState<Doctor | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [availDoctor, setAvailDoctor] = React.useState<Doctor | null>(null);
  const [availOpen, setAvailOpen] = React.useState(false);

  const handleRemove = async (doctorId: string) => {
    await fetch(`/api/clinics/${clinicId}/doctors/${doctorId}`, { method: "DELETE" });
    router.refresh();
  };

  const columns = [
    {
      key: "name",
      header: "Doctor",
      cell: (d: Doctor) => (
        <div>
          <p className="font-medium">{d.name}</p>
          <p className="text-xs text-muted-foreground">{d.phone}</p>
        </div>
      ),
    },
    {
      key: "specialization",
      header: "Specialization",
      cell: (d: Doctor) => (
        <span className="text-sm text-muted-foreground">{d.specialization || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (d: Doctor) => <Badge variant="outline">{d.role}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (d: Doctor) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setAvailDoctor(d); setAvailOpen(true); }}
            aria-label={`View schedule for ${d.name}`}
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setEditDoctor(d); setEditOpen(true); }}
            aria-label={`Edit ${d.name}`}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(d.id)}
            aria-label={`Remove ${d.name}`}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="text-muted-foreground">{clinicName} · {initialDoctors.length} doctors</p>
        </div>
        <AddDoctorDialog clinicId={clinicId} onDoctorAdded={() => router.refresh()} />
      </div>

      <DataTable
        columns={columns}
        data={initialDoctors}
        emptyMessage="No doctors added yet. Click 'Add Doctor' to get started."
      />

      <EditDoctorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        doctor={editDoctor}
        clinicId={clinicId}
        onUpdated={() => router.refresh()}
      />

      <DoctorAvailabilityDialog
        open={availOpen}
        onOpenChange={setAvailOpen}
        doctorId={availDoctor?.id ?? null}
        doctorName={availDoctor?.name ?? ""}
        clinicId={clinicId}
      />
    </div>
  );
}
