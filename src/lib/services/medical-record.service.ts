import { prisma } from "@/lib/prisma";
import type { CreateMedicalRecordInput } from "@/lib/validations/appointment";
import { validateFileUpload } from "@/lib/utils/upload";

export async function createMedicalRecord(
  appointmentId: string,
  clinicId: string,
  doctorId: string,
  input: CreateMedicalRecordInput
) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw new Error("Appointment not found");
  if (appointment.clinicId !== clinicId) throw new Error("Forbidden");

  return prisma.medicalRecord.create({
    data: {
      appointmentId,
      clinicId,
      doctorId,
      patientId: appointment.patientId,
      visitDate: appointment.date,
      diagnosis: input.diagnosis,
      notes: input.notes,
      prescription: input.prescription,
    },
  });
}

export async function addFileToRecord(
  recordId: string,
  uploadedBy: string,
  file: { fileName: string; fileUrl: string; fileType: string; fileSize: number }
) {
  const validation = validateFileUpload(file.fileType, file.fileSize);
  if (!validation.valid) throw new Error(validation.error);

  return prisma.fileAttachment.create({
    data: {
      recordId,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedBy,
    },
  });
}
