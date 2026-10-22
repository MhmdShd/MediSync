import { describe, it, expect } from "vitest";
import { generateTimeSlots, isTimeAfter, isTimeBefore, formatTimeDisplay } from "@/lib/utils/date";

describe("generateTimeSlots", () => {
  it("generates correct slots for 30-minute intervals", () => {
    const slots = generateTimeSlots("09:00", "11:00", 30);
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({ startTime: "09:00", endTime: "09:30" });
    expect(slots[3]).toEqual({ startTime: "10:30", endTime: "11:00" });
  });

  it("generates correct slots for 60-minute intervals", () => {
    const slots = generateTimeSlots("09:00", "12:00", 60);
    expect(slots).toHaveLength(3);
  });

  it("returns empty array when end is before start", () => {
    const slots = generateTimeSlots("11:00", "09:00", 30);
    expect(slots).toHaveLength(0);
  });

  it("does not include partial slot at end", () => {
    const slots = generateTimeSlots("09:00", "10:20", 30);
    expect(slots).toHaveLength(2);
  });
});

describe("isTimeAfter", () => {
  it("returns true when time1 is after time2", () => {
    expect(isTimeAfter("10:30", "09:00")).toBe(true);
  });

  it("returns false when time1 is before time2", () => {
    expect(isTimeAfter("08:00", "09:00")).toBe(false);
  });
});

describe("isTimeBefore", () => {
  it("returns true when time1 is before time2", () => {
    expect(isTimeBefore("08:00", "09:00")).toBe(true);
  });
});

describe("formatTimeDisplay", () => {
  it("formats 24h time to 12h AM/PM", () => {
    expect(formatTimeDisplay("09:00")).toBe("9:00 AM");
    expect(formatTimeDisplay("14:30")).toBe("2:30 PM");
  });
});
