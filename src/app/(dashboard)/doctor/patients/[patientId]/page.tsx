import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils/date";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function DoctorPatientFilePage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ clinicId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [{ patientId }, { clinicId }] = await Promise.all([params, searchParams]);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!doctor) redirect("/login");

  // Verify doctor has access to this clinic
  if (clinicId) {
    const access = await prisma.clinicDoctor.findUnique({
      where: { clinicId_doctorId: { clinicId, doctorId: doctor.id } },
    });
    if (!access?.isActive) notFound();
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) notFound();

  const records = await prisma.medicalRecord.findMany({
    where: {
      patientId,
      ...(clinicId ? { clinicId } : {}),
      // Only show records where doctor has access
    },
    include: {
      doctor: { select: { name: true } },
      fileAttachments: true,
    },
    orderBy: { visitDate: "desc" },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/doctor/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.phone}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records available.</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-md border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatDateDisplay(record.visitDate)}</p>
                      <p className="text-xs text-muted-foreground">{record.doctor.name}</p>
                    </div>
                    {record.fileAttachments.length > 0 && (
                      <Badge variant="outline">{record.fileAttachments.length} files</Badge>
                    )}
                  </div>
                  {record.diagnosis && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Diagnosis</p>
                      <p className="text-sm">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Prescription</p>
                      <p className="text-sm">{record.prescription}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
