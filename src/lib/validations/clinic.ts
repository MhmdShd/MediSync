import { z } from "zod";

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:mm");

const dayHoursSchema = z.object({
  open: timeSchema,
  close: timeSchema,
});

export const operatingHoursSchema = z.object({
  mon: dayHoursSchema.optional(),
  tue: dayHoursSchema.optional(),
  wed: dayHoursSchema.optional(),
  thu: dayHoursSchema.optional(),
  fri: dayHoursSchema.optional(),
  sat: dayHoursSchema.optional(),
  sun: dayHoursSchema.optional(),
});

export const createClinicSchema = z.object({
  name: z.string().min(2, "Clinic name is required").max(100),
  address: z.string().min(5, "Address is required").max(500),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  timezone: z.string().default("UTC"),
  operatingHours: operatingHoursSchema,
});

export const updateClinicSchema = createClinicSchema.partial();

export type CreateClinicInput = z.infer<typeof createClinicSchema>;
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;
