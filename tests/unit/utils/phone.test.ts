import { describe, it, expect } from "vitest";
import { normalizePhone, isValidE164, formatPhoneDisplay } from "@/lib/utils/phone";

describe("normalizePhone", () => {
  it("preserves valid E.164 with plus prefix", () => {
    expect(normalizePhone("+9641234567890")).toBe("+9641234567890");
  });

  it("strips non-digit characters and adds plus", () => {
    expect(normalizePhone("964-123-456-7890")).toBe("+9641234567890");
  });

  it("handles spaces in phone number", () => {
    expect(normalizePhone("+964 123 456 7890")).toBe("+9641234567890");
  });
});

describe("isValidE164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(isValidE164("+9641234567890")).toBe(true);
    expect(isValidE164("+12125551234")).toBe(true);
    expect(isValidE164("+447911123456")).toBe(true);
  });

  it("rejects numbers without plus prefix", () => {
    expect(isValidE164("9641234567890")).toBe(false);
  });

  it("rejects numbers starting with +0", () => {
    expect(isValidE164("+0123456789")).toBe(false);
  });

  it("rejects numbers that are too long", () => {
    expect(isValidE164("+12345678901234567")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidE164("")).toBe(false);
  });
});

describe("formatPhoneDisplay", () => {
  it("formats E.164 number with spaces", () => {
    const formatted = formatPhoneDisplay("+9641234567890");
    expect(formatted).toContain("+964");
  });

  it("returns non-E.164 numbers unchanged", () => {
    expect(formatPhoneDisplay("notaphone")).toBe("notaphone");
  });
});
