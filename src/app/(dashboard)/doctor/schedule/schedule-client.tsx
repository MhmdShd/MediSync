"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DaySchedule {
  dayOfWeek: number;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDurationMinutes: number;
}

interface ClinicSchedule {
  clinicId: string;
  clinicName: string;
  schedules: DaySchedule[];
}

interface Props {
  doctorId: string;
  clinics: ClinicSchedule[];
}

export function ScheduleClient({ doctorId, clinics: initialClinics }: Props) {
  const [clinics, setClinics] = useState(initialClinics);
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const updateDay = (clinicId: string, dayOfWeek: number, patch: Partial<DaySchedule>) => {
    setClinics((prev) =>
      prev.map((c) =>
        c.clinicId === clinicId
          ? {
              ...c,
              schedules: c.schedules.map((s) =>
                s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s
              ),
            }
          : c
      )
    );
  };

  const saveSchedule = async (clinic: ClinicSchedule) => {
    setSaving(clinic.clinicId);
    const activeDays = clinic.schedules.filter((s) => s.isActive);
    const res = await fetch(
      `/api/clinics/${clinic.clinicId}/doctors/${doctorId}/schedule`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedules: activeDays.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            slotDurationMinutes: s.slotDurationMinutes,
          })),
        }),
      }
    );
    setSaving(null);
    if (res.ok) {
      setMessages((m) => ({ ...m, [clinic.clinicId]: "Saved successfully." }));
    } else {
      const d = await res.json();
      setMessages((m) => ({ ...m, [clinic.clinicId]: d.error ?? "Save failed." }));
    }
    setTimeout(() => setMessages((m) => ({ ...m, [clinic.clinicId]: "" })), 3000);
  };

  return (
    <div className="space-y-6">
      {clinics.map((clinic) => (
        <Card key={clinic.clinicId}>
          <CardHeader>
            <CardTitle>{clinic.clinicName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {clinic.schedules.map((s) => (
                <div key={s.dayOfWeek} className="flex items-center gap-4">
                  <div className="w-5">
                    <input
                      type="checkbox"
                      checked={s.isActive}
                      onChange={(e) => updateDay(clinic.clinicId, s.dayOfWeek, { isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-input"
                    />
                  </div>
                  <span className="w-24 text-sm font-medium">{s.day}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="space-y-0.5">
                      <Label className="text-xs text-muted-foreground">Start</Label>
                      <input
                        type="time"
                        value={s.startTime}
                        disabled={!s.isActive}
                        onChange={(e) => updateDay(clinic.clinicId, s.dayOfWeek, { startTime: e.target.value })}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                      />
                    </div>
                    <span className="text-muted-foreground mt-4">–</span>
                    <div className="space-y-0.5">
                      <Label className="text-xs text-muted-foreground">End</Label>
                      <input
                        type="time"
                        value={s.endTime}
                        disabled={!s.isActive}
                        onChange={(e) => updateDay(clinic.clinicId, s.dayOfWeek, { endTime: e.target.value })}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-0.5 ml-4">
                      <Label className="text-xs text-muted-foreground">Slot (min)</Label>
                      <select
                        value={s.slotDurationMinutes}
                        disabled={!s.isActive}
                        onChange={(e) => updateDay(clinic.clinicId, s.dayOfWeek, { slotDurationMinutes: Number(e.target.value) })}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                      >
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                        <option value={60}>60</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button
                onClick={() => saveSchedule(clinic)}
                disabled={saving === clinic.clinicId}
              >
                {saving === clinic.clinicId ? "Saving…" : "Save Schedule"}
              </Button>
              {messages[clinic.clinicId] && (
                <span className="text-sm text-muted-foreground">{messages[clinic.clinicId]}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
