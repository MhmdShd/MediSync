"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddPatientDialog } from "@/components/shared/add-patient-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { formatDateDisplay } from "@/lib/utils/date";

interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string | null;
  dateOfBirth: string | null;
  registeredAt: string;
  lastVisitAt: string | null;
}

interface PatientsClientProps {
  clinicId: string;
  clinicName: string;
  initialPatients: Patient[];
}

export function PatientsClient({ clinicId, clinicName, initialPatients }: PatientsClientProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = initialPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const columns = [
    {
      key: "name",
      header: "Patient",
      cell: (p: Patient) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.phone}</p>
        </div>
      ),
    },
    {
      key: "gender",
      header: "Gender",
      cell: (p: Patient) => (
        <span className="text-sm text-muted-foreground">{p.gender || "—"}</span>
      ),
    },
    {
      key: "dob",
      header: "Date of Birth",
      cell: (p: Patient) => (
        <span className="text-sm text-muted-foreground">
          {p.dateOfBirth ? formatDateDisplay(p.dateOfBirth) : "—"}
        </span>
      ),
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      cell: (p: Patient) => (
        <span className="text-sm text-muted-foreground">
          {p.lastVisitAt ? formatDateDisplay(p.lastVisitAt) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (p: Patient) => (
        <Link href={`/clinic/patients/${p.id}`}>
          <Button variant="ghost" size="icon" aria-label={`View ${p.name}`}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">{clinicName} · {initialPatients.length} patients</p>
        </div>
        <AddPatientDialog clinicId={clinicId} onPatientAdded={() => router.refresh()} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No patients found. Click 'Add Patient' to get started."
      />
    </div>
  );
}
