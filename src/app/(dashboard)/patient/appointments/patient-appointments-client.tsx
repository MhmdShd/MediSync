"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookAppointmentDialog } from "@/components/shared/book-appointment-dialog";
import type { AppointmentStatus } from "@prisma/client";

interface ClinicOption {
  id: string;
  name: string;
}

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
  doctorName: string;
  clinicName: string;
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

interface Props {
  patientId: string;
  clinics: ClinicOption[];
}

export function PatientAppointmentsClient({ patientId, clinics }: Props) {
  const [selectedClinicId, setSelectedClinicId] = useState(clinics[0]?.id ?? "");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!selectedClinicId) return;
    setLoading(true);
    const res = await fetch(
      `/api/clinics/${selectedClinicId}/appointments?patientId=${patientId}`
    );
    if (res.ok) {
      const data = await res.json();
      setAppointments(
        (data.appointments ?? []).map(
          (a: {
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            status: AppointmentStatus;
            notes: string | null;
            doctor: { id: string; name: string };
          }) => ({
            id: a.id,
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
            status: a.status,
            doctorName: a.doctor.name,
            clinicName: "",
            notes: a.notes,
          })
        )
      );
    }
    setLoading(false);
  }, [selectedClinicId, patientId]);

  const fetchDoctors = useCallback(async () => {
    if (!selectedClinicId) return;
    const res = await fetch(`/api/clinics/${selectedClinicId}/doctors`);
    if (res.ok) {
      const data = await res.json();
      setDoctors(
        (data.doctors ?? []).map(
          (d: { id: string; name: string; specialty: string | null }) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty ?? "",
          })
        )
      );
    }
  }, [selectedClinicId]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  const handleCancel = async (appointmentId: string) => {
    await fetch(`/api/clinics/${selectedClinicId}/appointments/${appointmentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Patient cancelled" }),
    });
    fetchAppointments();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {clinics.length > 1 && (
          <select
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        <Button className="ml-auto" onClick={() => setDialogOpen(true)} disabled={!selectedClinicId}>
          Book Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming &amp; Past Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{format(new Date(a.date), "MMM d, yyyy")} at {a.startTime}</p>
                    <p className="text-sm text-muted-foreground">Dr. {a.doctorName}</p>
                    {a.notes && <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_COLORS[a.status] as Parameters<typeof Badge>[0]["variant"]}>
                      {a.status.replace("_", " ")}
                    </Badge>
                    {(a.status === "SCHEDULED" || a.status === "CONFIRMED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(a.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BookAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clinicId={selectedClinicId}
        doctors={doctors}
        onBooked={fetchAppointments}
        preselectedPatientId={patientId}
      />
    </div>
  );
}
