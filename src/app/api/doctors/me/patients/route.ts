import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDoctorPatients } from "@/lib/services/doctor-dashboard.service";
import { paginationSchema } from "@/lib/validations/shared";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const clinicId = searchParams.get("clinicId");
  if (!clinicId) {
    return NextResponse.json({ error: "clinicId is required" }, { status: 400 });
  }

  const { page, pageSize } = paginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  const data = await getDoctorPatients(session.user.id, clinicId, page, pageSize);
  return NextResponse.json(data);
}
