import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DoctorsClient } from "./doctors-client";

export default async function DoctorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clinics = await prisma.clinic.findMany({
    where: { ownerId: session.user.id, isActive: true },
    select: { id: true, name: true },
  });

  if (clinics.length === 0) {
    redirect("/clinic/settings");
  }

  const clinic = clinics[0];

  const clinicDoctors = await prisma.clinicDoctor.findMany({
    where: { clinicId: clinic.id, isActive: true },
    include: {
      doctor: {
        include: { user: { select: { avatarUrl: true } } },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const doctors = clinicDoctors.map((cd) => ({
    id: cd.doctor.id,
    name: cd.doctor.name,
    phone: cd.doctor.phone,
    specialization: cd.doctor.specialization,
    avatarUrl: cd.doctor.user.avatarUrl,
    role: cd.role,
    joinedAt: cd.joinedAt.toISOString(),
  }));

  return <DoctorsClient clinicId={clinic.id} clinicName={clinic.name} initialDoctors={doctors} />;
}
