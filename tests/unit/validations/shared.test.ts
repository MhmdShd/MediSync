import { describe, it, expect } from "vitest";
import { phoneSchema, passwordSchema, paginationSchema } from "@/lib/validations/shared";

describe("phoneSchema", () => {
  it("accepts valid E.164 number", () => {
    const result = phoneSchema.safeParse("+9641234567890");
    expect(result.success).toBe(true);
  });

  it("rejects number without plus prefix", () => {
    const result = phoneSchema.safeParse("9641234567890");
    expect(result.success).toBe(false);
  });

  it("rejects number starting with +0", () => {
    const result = phoneSchema.safeParse("+0123456789");
    expect(result.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts valid password", () => {
    const result = passwordSchema.safeParse("SecurePass1");
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = passwordSchema.safeParse("Abc1");
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = passwordSchema.safeParse("securepass1");
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = passwordSchema.safeParse("SecurePassword");
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("uses defaults when no values provided", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("coerces string values to numbers", () => {
    const result = paginationSchema.parse({ page: "2", pageSize: "10" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it("rejects page less than 1", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects pageSize greater than 100", () => {
    const result = paginationSchema.safeParse({ pageSize: 200 });
    expect(result.success).toBe(false);
  });
});
