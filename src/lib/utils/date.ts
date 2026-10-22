import { format, parse, addMinutes, isAfter, isBefore, startOfDay } from "date-fns";

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number
): Array<{ startTime: string; endTime: string }> {
  const slots: Array<{ startTime: string; endTime: string }> = [];
  const base = new Date(2000, 0, 1);
  const start = parse(startTime, "HH:mm", base);
  const end = parse(endTime, "HH:mm", base);

  let current = start;
  while (isBefore(current, end)) {
    const next = addMinutes(current, slotDurationMinutes);
    if (isAfter(next, end)) break;
    slots.push({
      startTime: format(current, "HH:mm"),
      endTime: format(next, "HH:mm"),
    });
    current = next;
  }
  return slots;
}

export function isTimeAfter(time1: string, time2: string): boolean {
  const base = new Date(2000, 0, 1);
  return isAfter(parse(time1, "HH:mm", base), parse(time2, "HH:mm", base));
}

export function isTimeBefore(time1: string, time2: string): boolean {
  const base = new Date(2000, 0, 1);
  return isBefore(parse(time1, "HH:mm", base), parse(time2, "HH:mm", base));
}

export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatTimeDisplay(time: string): string {
  const base = new Date(2000, 0, 1);
  return format(parse(time, "HH:mm", base), "h:mm a");
}

export function isDateInPast(dateStr: string): boolean {
  return isBefore(new Date(dateStr), startOfDay(new Date()));
}
