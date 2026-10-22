import { vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    clinic: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    doctor: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    patient: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    clinicDoctor: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    clinicPatient: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    appointment: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    medicalRecord: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    fileAttachment: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));
