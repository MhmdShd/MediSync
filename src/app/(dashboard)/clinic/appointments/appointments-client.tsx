"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { BookAppointmentDialog } from "@/components/shared/book-appointment-dialog";
import { EditAppointmentDialog } from "@/components/shared/edit-appointment-dialog";
import type { AppointmentStatus } from "@prisma/client";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
}

interface AppointmentRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
  notes: string | null;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

const columns = [
  { key: "date", header: "Date", cell: (v: AppointmentRow) => format(new Date(v.date), "MMM d, yyyy") },
  { key: "startTime", header: "Time", cell: (v: AppointmentRow) => `${v.startTime} – ${v.endTime}` },
  { key: "patientName", header: "Patient", cell: (v: AppointmentRow) => v.patientName },
  { key: "doctorName", header: "Doctor", cell: (v: AppointmentRow) => v.doctorName },
  {
    key: "status",
    header: "Status",
    cell: (v: AppointmentRow) => (
      <Badge variant={STATUS_COLORS[v.status] as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}>
        {v.status.replace("_", " ")}
      </Badge>
    ),
  },
];

interface Props {
  clinicId: string;
  doctors: DoctorOption[];
}

export function AppointmentsClient({ clinicId, doctors }: Props) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (dateFilter) sp.set("date", dateFilter);
      if (statusFilter) sp.set("status", statusFilter);
      const res = await fetch(`/api/clinics/${clinicId}/appointments?${sp}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.appointments) ? data.appointments : [];
        const mapped = list.map(
          (a: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            status: AppointmentStatus;
            notes: string | null;
            patient: { id: string; name: string } | null;
            doctor: { id: string; name: string } | null;
          }) => ({
            id: a.id,
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
            status: a.status,
            patientName: a.patient?.name ?? "Unknown",
            doctorName: a.doctor?.name ?? "Unknown",
            notes: a.notes,
          })
        );
        setAppointments(mapped);
      } else {
        console.error("Failed to fetch appointments:", res.status);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
    setLoading(false);
  }, [clinicId, dateFilter, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
        <Button variant="outline" onClick={() => { setDateFilter(""); setStatusFilter(""); }}>
          Clear
        </Button>
        <Button className="ml-auto" onClick={() => setDialogOpen(true)}>
          Book Appointment
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">All Appointments</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <DataTable
            data={appointments}
            columns={columns}
            onRowClick={(row) => {
              setSelectedAppointment(row);
              setEditDialogOpen(true);
            }}
          />
        )}
      </div>

      <BookAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clinicId={clinicId}
        doctors={doctors}
        onBooked={fetchAppointments}
      />

      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={selectedAppointment}
        clinicId={clinicId}
        onUpdated={fetchAppointments}
      />
    </div>
  );
}
