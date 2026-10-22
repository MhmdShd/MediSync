"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check, User } from "lucide-react";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  gender?: string | null;
  dateOfBirth?: string | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  doctors: DoctorOption[];
  onBooked: () => void;
  preselectedPatientId?: string;
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
  clinicId,
  doctors,
  onBooked,
  preselectedPatientId,
}: Props) {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patientId, setPatientId] = useState(preselectedPatientId ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  // Patient dropdown state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // Load all clinic patients when dialog opens
  useEffect(() => {
    if (!open || !clinicId) return;
    fetch(`/api/clinics/${clinicId}/patients?page=1&pageSize=100`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.patients ?? [];
        setPatients(list);
        // If preselectedPatientId, find and set name
        if (preselectedPatientId) {
          const p = list.find((pt: Patient) => pt.id === preselectedPatientId);
          if (p) setSelectedPatientName(p.name);
        }
      })
      .catch(() => setPatients([]));
  }, [open, clinicId, preselectedPatientId]);

  // Close patient dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load slots when doctor + date selected
  useEffect(() => {
    if (doctorId && date) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      fetch(`/api/clinics/${clinicId}/doctors/${doctorId}/availability?date=${date}`)
        .then((r) => r.json())
        .then((d) => setSlots(d.slots ?? []))
        .finally(() => setSlotsLoading(false));
    } else {
      setSlots([]);
    }
  }, [clinicId, doctorId, date]);

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  const handleSelectPatient = (patient: Patient) => {
    setPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setPatientSearch("");
    setShowPatientDropdown(false);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!doctorId || !date || !selectedSlot || (!patientId && !preselectedPatientId)) {
      setError("Fill in all required fields.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/clinics/${clinicId}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        patientId: patientId || preselectedPatientId,
        date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onBooked();
      onOpenChange(false);
      resetForm();
    } else {
      const d = await res.json();
      setError(d.error ?? "Booking failed.");
    }
  };

  const resetForm = () => {
    setDoctorId("");
    setDate("");
    setSlots([]);
    setSelectedSlot(null);
    if (!preselectedPatientId) {
      setPatientId("");
      setSelectedPatientName("");
      setPatientSearch("");
    }
    setNotes("");
    setError("");
    setShowPatientDropdown(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Doctor */}
          <div className="space-y-1">
            <Label>Doctor</Label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Select doctor…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.specialty ? ` — ${d.specialty}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Date</Label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>

          {/* Slots */}
          {slotsLoading && <p className="text-sm text-muted-foreground">Loading slots…</p>}

          {slots.length > 0 && (
            <div className="space-y-1">
              <Label>Available Slots</Label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      !slot.available && "cursor-not-allowed opacity-40",
                      slot.available && selectedSlot?.startTime === slot.startTime
                        ? "border-primary bg-primary text-primary-foreground"
                        : slot.available
                        ? "border-input hover:bg-accent"
                        : "border-input"
                    )}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {slots.length === 0 && doctorId && date && !slotsLoading && (
            <p className="text-sm text-muted-foreground">No available slots for this date.</p>
          )}

          {/* Patient Dropdown */}
          {!preselectedPatientId && (
            <div className="space-y-1" ref={patientDropdownRef}>
              <Label>Patient</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  <span className={cn("truncate", !selectedPatientName && "text-muted-foreground")}>
                    {selectedPatientName || "Select a patient…"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>

                {showPatientDropdown && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search by name or phone…"
                        className="h-8 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                        autoFocus
                      />
                    </div>
                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                      {filteredPatients.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                          No patients found.
                        </p>
                      ) : (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handleSelectPatient(patient)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent",
                              patientId === patient.id && "bg-accent"
                            )}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">{patient.phone}</p>
                            </div>
                            {patientId === patient.id && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Reason for visit…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Booking…" : "Book Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
