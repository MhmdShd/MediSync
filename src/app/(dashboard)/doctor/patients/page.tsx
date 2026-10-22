import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/utils/date";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function DoctorPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { clinicId } = await searchParams;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      clinicDoctors: {
        where: { isActive: true },
        include: { clinic: { select: { id: true, name: true } } },
      },
    },
  });

  if (!doctor) redirect("/login");

  const targetClinicId =
    clinicId ?? (doctor.clinicDoctors[0]?.clinicId);

  if (!targetClinicId) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Not associated with any clinic.
      </div>
    );
  }

  const clinicPatients = await prisma.clinicPatient.findMany({
    where: { clinicId: targetClinicId },
    include: { patient: true },
    orderBy: { registeredAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patients</h1>
      <div className="space-y-2">
        {clinicPatients.length === 0 ? (
          <p className="text-muted-foreground text-sm">No patients in this clinic yet.</p>
        ) : (
          clinicPatients.map((cp) => (
            <Link
              key={cp.patient.id}
              href={`/doctor/patients/${cp.patient.id}?clinicId=${targetClinicId}`}
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{cp.patient.name}</p>
                    <p className="text-xs text-muted-foreground">{cp.patient.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">
                      Registered {formatDateDisplay(cp.registeredAt)}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
