import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateClinicCover } from "@/lib/services/clinic.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;
  const body = await request.json();
  const { coverUrl } = body as { coverUrl: string };

  if (!coverUrl) {
    return NextResponse.json({ error: "coverUrl is required" }, { status: 400 });
  }

  try {
    await updateClinicCover(clinicId, session.user.id, coverUrl);
    return NextResponse.json({ coverUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
