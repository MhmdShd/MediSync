import { z } from "zod";
import { phoneSchema, passwordSchema, usernameSchema } from "./shared";

export const registerSchema = z.object({
  phone: phoneSchema,
  username: usernameSchema.optional(),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["CLINIC_ADMIN", "DOCTOR", "PATIENT"]),
  clinicName: z.string().min(2).max(100).optional(),
  clinicAddress: z.string().min(5).max(200).optional(),
  clinicPhone: z.string().min(7).max(20).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Phone number or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  phone: phoneSchema,
});

export const resetPasswordConfirmSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
