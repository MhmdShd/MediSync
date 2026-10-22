import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClinic, getClinicById, listClinicsForUser } from "@/lib/services/clinic.service";
import { prisma } from "@/lib/prisma";

const mockPrisma = vi.mocked(prisma);

const mockClinic = {
  id: "clinic-1",
  name: "Test Clinic",
  address: "123 Test St",
  phone: "+9641234567890",
  email: "test@clinic.iq",
  logoUrl: null,
  coverUrl: null,
  timezone: "UTC",
  operatingHours: {},
  isActive: true,
  ownerId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

describe("createClinic", () => {
  it("creates clinic with provided data", async () => {
    (mockPrisma.clinic.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockClinic);

    const result = await createClinic("user-1", {
      name: "Test Clinic",
      address: "123 Test St",
      phone: "+9641234567890",
      timezone: "UTC",
      operatingHours: {},
    });

    expect(result).toEqual(mockClinic);
    expect(mockPrisma.clinic.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Test Clinic", ownerId: "user-1" }),
      })
    );
  });
});

describe("getClinicById", () => {
  it("returns clinic with counts", async () => {
    const mockWithCount = {
      ...mockClinic,
      _count: { clinicDoctors: 5, clinicPatients: 100 },
    };
    (mockPrisma.clinic.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockWithCount);

    const result = await getClinicById("clinic-1");
    expect(result?._count.clinicDoctors).toBe(5);
    expect(result?._count.clinicPatients).toBe(100);
  });

  it("returns null when clinic not found", async () => {
    (mockPrisma.clinic.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getClinicById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("listClinicsForUser", () => {
  it("returns empty array when user not found", async () => {
    (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await listClinicsForUser("nonexistent");
    expect(result).toEqual([]);
  });

  it("returns owned clinics for CLINIC_ADMIN", async () => {
    (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      role: "CLINIC_ADMIN",
      clinicsOwned: [mockClinic],
      doctor: null,
      patient: null,
    });

    const result = await listClinicsForUser("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("OWNER");
  });
});
