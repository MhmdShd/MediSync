import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientAppointmentsClient } from "./patient-appointments-client";

export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) redirect("/patient/dashboard");

  const clinicPatients = await prisma.clinicPatient.findMany({
    where: { patientId: patient.id },
    include: {
      clinic: true,
    },
  });

  const clinics = clinicPatients.map((cp) => ({
    id: cp.clinic.id,
    name: cp.clinic.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">View and book appointments at your clinics</p>
      </div>
      <PatientAppointmentsClient patientId={patient.id} clinics={clinics} />
    </div>
  );
}
