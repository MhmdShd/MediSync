import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/shared/stats-card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, Calendar, Building2 } from "lucide-react";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date";

export default async function ClinicDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clinics = await prisma.clinic.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: {
          clinicDoctors: { where: { isActive: true } },
          clinicPatients: true,
        },
      },
    },
  });

  const clinicIds = clinics.map((c) => c.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      clinicId: { in: clinicIds },
      date: { gte: today, lt: tomorrow },
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      patient: { select: { name: true } },
      doctor: { select: { name: true } },
      clinic: { select: { name: true } },
    },
    orderBy: [{ clinicId: "asc" }, { startTime: "asc" }],
  });

  const totalDoctors = clinics.reduce((sum, c) => sum + c._count.clinicDoctors, 0);
  const totalPatients = clinics.reduce((sum, c) => sum + c._count.clinicPatients, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clinic Dashboard</h1>
        <p className="text-muted-foreground">
          {clinics.length === 1 ? clinics[0].name : `Managing ${clinics.length} clinics`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Clinics" value={clinics.length} icon={Building2} />
        <StatsCard title="Active Doctors" value={totalDoctors} icon={UserCog} />
        <StatsCard title="Total Patients" value={totalPatients} icon={Users} />
        <StatsCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Today&apos;s Appointments</h3>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-card transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{appt.patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {appt.doctor.name} · {appt.clinic.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-sm font-medium">{formatTimeDisplay(appt.startTime)}</p>
                  </div>
                  <Badge variant={appt.status === "CONFIRMED" ? "success" : "secondary"}>
                    {appt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
