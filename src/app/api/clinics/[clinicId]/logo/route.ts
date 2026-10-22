import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateClinicLogo } from "@/lib/services/clinic.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clinicId } = await params;

  // In production, integrate with Uploadthing/S3
  // For now accept logoUrl directly in JSON body
  const body = await request.json();
  const { logoUrl } = body as { logoUrl: string };

  if (!logoUrl) {
    return NextResponse.json({ error: "logoUrl is required" }, { status: 400 });
  }

  try {
    await updateClinicLogo(clinicId, session.user.id, logoUrl);
    return NextResponse.json({ logoUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
