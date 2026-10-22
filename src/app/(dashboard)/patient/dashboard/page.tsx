import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPatientDashboard } from "@/lib/services/patient-dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date";
import Link from "next/link";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getPatientDashboard(session.user.id);
  if (!data) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {data.patient.name}</h1>
        <p className="text-muted-foreground">Your health dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard title="Clinics Visited" value={data.clinics.length} icon={Building2} />
        <StatsCard title="Upcoming Appointments" value={data.upcomingAppointments.length} icon={Calendar} />
      </div>

      {data.upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{appt.clinicName}</p>
                  <p className="text-xs text-muted-foreground">{appt.doctorName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDateDisplay(appt.date)}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeDisplay(appt.startTime)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Your Clinics</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.clinics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not registered at any clinic yet.</p>
          ) : (
            data.clinics.map((clinic) => (
              <Link key={clinic.id} href={`/patient/records?clinicId=${clinic.id}`}>
                <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{clinic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {clinic.visitCount} visit{clinic.visitCount !== 1 ? "s" : ""}
                        {clinic.lastVisit && ` · Last: ${formatDateDisplay(clinic.lastVisit)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">View Records</Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
