import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPatientAllRecords } from "@/lib/services/patient-dashboard.service";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay } from "@/lib/utils/date";
import { FileText, Download, Building2 } from "lucide-react";
import Link from "next/link";

export default async function PatientRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicId?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { clinicId, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const pageSize = 10;

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      clinicPatients: {
        include: {
          clinic: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!patient) {
    redirect("/patient/dashboard");
  }

  const clinics = patient.clinicPatients.map((cp) => cp.clinic);

  const data = clinicId
    ? await getPatientAllRecords(session.user.id, page, pageSize)
    : await getPatientAllRecords(session.user.id, page, pageSize);

  if (!data) {
    redirect("/patient/dashboard");
  }

  // Filter by clinic if selected
  const records = clinicId
    ? data.records.filter((r) => r.clinicId === clinicId)
    : data.records;

  const totalPages = Math.ceil((clinicId ? records.length : data.total) / pageSize);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical Records</h1>
      </div>

      {/* Clinic Filter */}
      {clinics.length > 0 && (
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by clinic:</span>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/patient/records"
              className={`rounded-full px-3 py-1 text-sm ${
                !clinicId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All Clinics
            </Link>
            {clinics.map((clinic) => (
              <Link
                key={clinic.id}
                href={`/patient/records?clinicId=${clinic.id}`}
                className={`rounded-full px-3 py-1 text-sm ${
                  clinicId === clinic.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {clinic.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <p className="text-muted-foreground">No records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {formatDateDisplay(record.visitDate)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{record.doctor.name}</span>
                      {record.clinic && (
                        <Badge variant="outline" className="text-xs">
                          {record.clinic.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {record.diagnosis && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Diagnosis
                    </p>
                    <p className="text-sm mt-1">{record.diagnosis}</p>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm mt-1">{record.notes}</p>
                  </div>
                )}
                {record.prescription && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Prescription
                    </p>
                    <p className="text-sm mt-1">{record.prescription}</p>
                  </div>
                )}
                {record.fileAttachments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Attachments
                    </p>
                    <div className="space-y-1">
                      {record.fileAttachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent transition-colors"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate">{file.fileName}</span>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/patient/records?${clinicId ? `clinicId=${clinicId}&` : ""}page=${page - 1}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/patient/records?${clinicId ? `clinicId=${clinicId}&` : ""}page=${page + 1}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
