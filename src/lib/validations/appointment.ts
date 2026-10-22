import { z } from "zod";
import { dateSchema, timeSchema } from "./shared";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().max(500).optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  cancelReason: z.string().max(500).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const setScheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: timeSchema,
      endTime: timeSchema,
      slotDurationMinutes: z.number().int().min(10).max(120).default(30),
    })
  ),
});

export const createMedicalRecordSchema = z.object({
  diagnosis: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
  prescription: z.string().max(2000).optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type SetScheduleInput = z.infer<typeof setScheduleSchema>;
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
