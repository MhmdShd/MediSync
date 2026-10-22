import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientsClient } from "./patients-client";

export default async function PatientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clinics = await prisma.clinic.findMany({
    where: { ownerId: session.user.id, isActive: true },
    select: { id: true, name: true },
  });

  if (clinics.length === 0) redirect("/clinic/settings");

  const clinic = clinics[0];

  const clinicPatients = await prisma.clinicPatient.findMany({
    where: { clinicId: clinic.id },
    include: { patient: true },
    orderBy: { registeredAt: "desc" },
    take: 20,
  });

  const patients = clinicPatients.map((cp) => ({
    id: cp.patient.id,
    name: cp.patient.name,
    phone: cp.patient.phone,
    gender: cp.patient.gender,
    dateOfBirth: cp.patient.dateOfBirth?.toISOString() ?? null,
    registeredAt: cp.registeredAt.toISOString(),
    lastVisitAt: cp.lastVisitAt?.toISOString() ?? null,
  }));

  return <PatientsClient clinicId={clinic.id} clinicName={clinic.name} initialPatients={patients} />;
}
