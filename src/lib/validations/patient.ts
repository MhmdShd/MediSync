import { z } from "zod";
import { phoneSchema } from "./shared";

export const searchPatientSchema = z.object({
  phone: z.string().min(7, "Enter at least 7 digits"),
});

export const createPatientSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodType: z.string().max(5).optional(),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(50).optional(),
});

export const updatePatientSchema = createPatientSchema.partial().omit({ phone: true });

export const addPatientToClinicSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("link"), patientId: z.string().uuid() }),
  z.object({
    action: z.literal("create"),
    phone: phoneSchema,
    name: z.string().min(2).max(100),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    bloodType: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
  }),
]);

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type AddPatientToClinicInput = z.infer<typeof addPatientToClinicSchema>;
