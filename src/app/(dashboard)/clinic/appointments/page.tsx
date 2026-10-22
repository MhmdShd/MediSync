import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentsClient } from "./appointments-client";

export default async function ClinicAppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clinic = await prisma.clinic.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!clinic) redirect("/clinic/settings");

  const doctors = await prisma.clinicDoctor.findMany({
    where: { clinicId: clinic.id },
    include: { doctor: true },
  });

  const doctorOptions = doctors.map((cd) => ({
    id: cd.doctor.id,
    name: cd.doctor.name,
    specialty: cd.doctor.specialization ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Manage and book appointments for {clinic.name}</p>
      </div>
      <AppointmentsClient clinicId={clinic.id} doctors={doctorOptions} />
    </div>
  );
}
