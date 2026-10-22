"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

interface AppointmentRow {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentRow | null;
  clinicId: string;
  onUpdated: () => void;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  clinicId,
  onUpdated,
}: Props) {
  const [status, setStatus] = useState<AppointmentStatus>("SCHEDULED");
  const [cancelReason, setCancelReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setCancelReason("");
      setDiagnosis("");
      setPrescription("");
      setRecordNotes("");
      setError("");
    }
  }, [appointment]);

  const handleUpdateStatus = async () => {
    if (!appointment) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/clinics/${clinicId}/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            cancelReason: status === "CANCELLED" ? cancelReason : undefined,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Update failed");
        setSaving(false);
        return;
      }

      if (status === "COMPLETED" && (diagnosis || prescription || recordNotes)) {
        const recRes = await fetch(
          `/api/clinics/${clinicId}/appointments/${appointment.id}/records`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ diagnosis, prescription, notes: recordNotes }),
          }
        );
        if (!recRes.ok) {
          const d = await recRes.json();
          setError(d.error ?? "Status updated but failed to save record");
          setSaving(false);
          onUpdated();
          return;
        }
      }

      onOpenChange(false);
      onUpdated();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/clinics/${clinicId}/appointments/${appointment.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );
      if (res.ok) {
        onOpenChange(false);
        onUpdated();
      } else {
        const d = await res.json();
        setError(d.error ?? "Cancel failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">No appointment selected</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Patient</Label>
              <p className="font-medium">{appointment.patientName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Doctor</Label>
              <p className="font-medium">{appointment.doctorName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Date</Label>
              <p className="font-medium">{format(new Date(appointment.date), "MMM d, yyyy")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Time</Label>
              <p className="font-medium">
                {appointment.startTime} – {appointment.endTime}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    appointment.status === "COMPLETED"
                      ? "default"
                      : appointment.status === "CANCELLED"
                      ? "destructive"
                      : appointment.status === "CONFIRMED"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {appointment.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Change Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {status === "CANCELLED" && (
            <div className="space-y-2">
              <Label>Cancel Reason</Label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Optional reason..."
              />
            </div>
          )}

          {status === "COMPLETED" && appointment.status !== "COMPLETED" && (
            <div className="space-y-3 rounded-md border border-border p-3">
              <p className="text-sm font-medium">Medical Record</p>
              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Diagnosis..."
                />
              </div>
              <div className="space-y-2">
                <Label>Prescription</Label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Medications, dosage, instructions..."
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Close
            </Button>
            {appointment.status !== "CANCELLED" && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Appt"
                )}
              </Button>
            )}
            <Button
              onClick={handleUpdateStatus}
              disabled={saving || status === appointment.status}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "COMPLETED" && appointment.status !== "COMPLETED" ? (
                "Complete & Save Record"
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
