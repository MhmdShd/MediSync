"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { ArrowLeft, Pencil, CheckCircle, Loader2, X } from "lucide-react";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date";
import Link from "next/link";

interface PatientData {
  id: string;
  name: string;
  phone: string;
  gender: string | null;
  dateOfBirth: string | null;
  bloodType: string | null;
  address: string | null;
  emergencyContact: string | null;
}

interface RecordData {
  id: string;
  visitDate: string;
  diagnosis: string | null;
  doctorName: string;
  fileCount: number;
}

interface AppointmentData {
  id: string;
  date: string;
  startTime: string;
  status: string;
  doctorName: string;
}

interface Props {
  patient: PatientData;
  records: RecordData[];
  appointments: AppointmentData[];
}

export function PatientDetailClient({ patient, records, appointments }: Props) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  const [name, setName] = React.useState(patient.name);
  const [gender, setGender] = React.useState(patient.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = React.useState(patient.dateOfBirth ?? "");
  const [bloodType, setBloodType] = React.useState(patient.bloodType ?? "");
  const [address, setAddress] = React.useState(patient.address ?? "");
  const [emergencyContact, setEmergencyContact] = React.useState(patient.emergencyContact ?? "");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth || undefined,
          bloodType: bloodType || undefined,
          address: address || undefined,
          emergencyContact: emergencyContact || undefined,
        }),
      });
      if (res.ok) {
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? "Save failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const upcoming = appointments.filter((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED");

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clinic/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.phone}</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        {saved && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Patient Info</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <FormField label="Name" htmlFor="edit-name">
                  <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                </FormField>
                <FormField label="Gender" htmlFor="edit-gender">
                  <select
                    id="edit-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </FormField>
                <FormField label="Date of Birth" htmlFor="edit-dob">
                  <Input id="edit-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </FormField>
                <FormField label="Blood Type" htmlFor="edit-blood">
                  <Input id="edit-blood" value={bloodType} onChange={(e) => setBloodType(e.target.value)} placeholder="A+, B-, O+..." />
                </FormField>
                <FormField label="Address" htmlFor="edit-addr">
                  <Input id="edit-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
                </FormField>
                <FormField label="Emergency Contact" htmlFor="edit-emerg">
                  <Input id="edit-emerg" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
                </FormField>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span>{patient.gender || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span>{patient.dateOfBirth ? formatDateDisplay(patient.dateOfBirth) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Type</span>
                  <span>{patient.bloodType || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span>{patient.address || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Contact</span>
                  <span>{patient.emergencyContact || "—"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{formatDateDisplay(appt.date)}</p>
                      <p className="text-xs text-muted-foreground">{appt.doctorName}</p>
                    </div>
                    <Badge variant="secondary">{formatTimeDisplay(appt.startTime)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Medical Records ({records.length})</CardTitle></CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet.</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{formatDateDisplay(record.visitDate)}</p>
                      <p className="text-xs text-muted-foreground">{record.doctorName}</p>
                    </div>
                    {record.fileCount > 0 && (
                      <Badge variant="outline">{record.fileCount} files</Badge>
                    )}
                  </div>
                  {record.diagnosis && (
                    <p className="mt-1 text-sm text-muted-foreground">{record.diagnosis}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
