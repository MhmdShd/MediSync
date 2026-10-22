import type { Role, AppointmentStatus, DoctorRole, Gender } from "@prisma/client";

export type { Role, AppointmentStatus, DoctorRole, Gender };

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SessionUser {
  id: string;
  phone: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  email?: string | null;
}

export interface PhoneLookupResult {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  alreadyLinked: boolean;
}

export interface DoctorLookupResult extends PhoneLookupResult {
  specialization?: string | null;
}

export interface PatientLookupResult extends PhoneLookupResult {
  dateOfBirth?: Date | null;
  gender?: Gender | null;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface OperatingHours {
  mon?: { open: string; close: string };
  tue?: { open: string; close: string };
  wed?: { open: string; close: string };
  thu?: { open: string; close: string };
  fri?: { open: string; close: string };
  sat?: { open: string; close: string };
  sun?: { open: string; close: string };
}
