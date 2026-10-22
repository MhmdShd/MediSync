import { z } from "zod";
import { phoneSchema } from "./shared";

export const searchDoctorSchema = z.object({
  phone: z.string().min(7, "Enter at least 7 digits"),
});

export const linkDoctorSchema = z.object({
  doctorId: z.string().uuid(),
});

export const createDoctorSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2).max(100),
  specialization: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
});

export const addDoctorToClinicSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("link"), doctorId: z.string().uuid() }),
  z.object({
    action: z.literal("create"),
    phone: phoneSchema,
    name: z.string().min(2).max(100),
    specialization: z.string().max(100).optional(),
  }),
]);

export const updateDoctorInClinicSchema = z.object({
  specialization: z.string().max(100).optional(),
  role: z.enum(["ATTENDING", "CONSULTANT", "VISITING"]).optional(),
  licenseNumber: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
});

export const updateDoctorProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  specialization: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
});

export type SearchDoctorInput = z.infer<typeof searchDoctorSchema>;
export type AddDoctorToClinicInput = z.infer<typeof addDoctorToClinicSchema>;
export type UpdateDoctorInClinicInput = z.infer<typeof updateDoctorInClinicSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;
