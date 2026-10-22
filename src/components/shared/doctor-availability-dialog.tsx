"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DaySchedule {
  dayOfWeek: number;
  day: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string | null;
  doctorName: string;
  clinicId: string;
}

function buildDefaultSchedules(): DaySchedule[] {
  return DAY_NAMES.map((day, i) => ({
    dayOfWeek: i,
    day,
    startTime: "09:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
    isActive: false,
  }));
}

export function DoctorAvailabilityDialog({ open, onOpenChange, doctorId, doctorName, clinicId }: Props) {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [editSchedules, setEditSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && doctorId) {
      setLoading(true);
      setEditing(false);
      setMessage("");
      fetch(`/api/clinics/${clinicId}/doctors/${doctorId}/schedule`)
        .then((r) => r.json())
        .then((data) => setSchedules(data.schedules ?? []))
        .finally(() => setLoading(false));
    }
  }, [open, doctorId, clinicId]);

  const startEditing = () => {
    const merged = buildDefaultSchedules().map((def) => {
      const existing = schedules.find((s) => s.dayOfWeek === def.dayOfWeek);
      return existing ?? def;
    });
    setEditSchedules(merged);
    setEditing(true);
    setMessage("");
  };

  const updateDay = (dayOfWeek: number, patch: Partial<DaySchedule>) => {
    setEditSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s))
    );
  };

  const handleSave = async () => {
    if (!doctorId) return;
    setSaving(true);
    setMessage("");
    const activeDays = editSchedules.filter((s) => s.isActive);
    const res = await fetch(
      `/api/clinics/${clinicId}/doctors/${doctorId}/schedule`,
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
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      const updated = (data.schedules ?? activeDays).map((s: DaySchedule) => ({
        ...s,
        day: DAY_NAMES[s.dayOfWeek],
      }));
      setSchedules(updated);
      setEditing(false);
      setMessage("Saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } else {
      const d = await res.json();
      setMessage(d.error ?? "Save failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={editing ? "max-w-2xl" : "max-w-md"}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{doctorName} — Schedule</DialogTitle>
            {!loading && !editing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : editing ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {editSchedules.map((s) => (
                <div key={s.dayOfWeek} className="flex items-center gap-4">
                  <div className="w-5">
                    <input
                      type="checkbox"
                      checked={s.isActive}
                      onChange={(e) => updateDay(s.dayOfWeek, { isActive: e.target.checked })}
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
                        onChange={(e) => updateDay(s.dayOfWeek, { startTime: e.target.value })}
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
                        onChange={(e) => updateDay(s.dayOfWeek, { endTime: e.target.value })}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-0.5 ml-4">
                      <Label className="text-xs text-muted-foreground">Slot (min)</Label>
                      <select
                        value={s.slotDurationMinutes}
                        disabled={!s.isActive}
                        onChange={(e) => updateDay(s.dayOfWeek, { slotDurationMinutes: Number(e.target.value) })}
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

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Schedule"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              {message && (
                <span className="text-sm text-muted-foreground">{message}</span>
              )}
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No schedule configured for this doctor.</p>
        ) : (
          <div className="space-y-2">
            {message && (
              <p className="text-sm text-green-600 mb-2">{message}</p>
            )}
            {schedules.map((s) => (
              <div key={s.dayOfWeek} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium">{s.day}</span>
                  {s.isActive ? (
                    <span className="text-sm text-muted-foreground">
                      {s.startTime} – {s.endTime}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Off</span>
                  )}
                </div>
                {s.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    {s.slotDurationMinutes}min slots
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
