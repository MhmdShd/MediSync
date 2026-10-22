import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPatientInClinicContext } from "@/lib/services/patient.service";
import { PatientDetailClient } from "./patient-detail-client";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { patientId } = await params;

  const clinics = await prisma.clinic.findMany({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  if (clinics.length === 0) redirect("/clinic/settings");

  const clinicId = clinics[0].id;
  const data = await getPatientInClinicContext(clinicId, patientId);

  if (!data) notFound();

  const { patient, records, appointments } = data;

  return (
    <PatientDetailClient
      patient={{
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split("T")[0] : null,
        bloodType: patient.bloodType,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
      }}
      records={records.map((r) => ({
        id: r.id,
        visitDate: r.visitDate.toISOString(),
        diagnosis: r.diagnosis,
        doctorName: r.doctor.name,
        fileCount: r._count.fileAttachments,
      }))}
      appointments={appointments.map((a) => ({
        id: a.id,
        date: a.date.toISOString(),
        startTime: a.startTime,
        status: a.status,
        doctorName: a.doctor.name,
      }))}
    />
  );
}
