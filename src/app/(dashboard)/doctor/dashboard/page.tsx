import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDoctorDashboard } from "@/lib/services/doctor-dashboard.service";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { formatTimeDisplay } from "@/lib/utils/date";

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { clinicId } = await searchParams;
  const data = await getDoctorDashboard(session.user.id, clinicId);

  if (!data) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.doctor.name}</h1>
          <p className="text-muted-foreground">{data.doctor.specialization ?? "Doctor"}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {data.clinics.map((clinic) => (
            <Badge
              key={clinic.id}
              variant={clinicId === clinic.id ? "default" : "outline"}
            >
              {clinic.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Patients" value={data.stats.totalPatients} icon={Users} />
        <StatsCard title="Today's Schedule" value={data.todayAppointments.length} icon={Calendar} />
        <StatsCard title="Completed Today" value={data.stats.completedToday} icon={CheckCircle} />
        <StatsCard title="This Week" value={data.stats.thisWeekAppointments} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {data.todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No appointments today.
            </p>
          ) : (
            <div className="space-y-3">
              {data.todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{appt.patientName}</p>
                    <p className="text-xs text-muted-foreground">{appt.clinicName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatTimeDisplay(appt.startTime)}</span>
                    <Badge variant={appt.status === "CONFIRMED" ? "success" : "secondary"} className="text-xs">
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
