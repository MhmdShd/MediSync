import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addFileToRecord } from "@/lib/services/medical-record.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recordId } = await params;
  const body = await request.json();
  const { fileName, fileUrl, fileType, fileSize } = body as {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };

  if (!fileName || !fileUrl || !fileType || !fileSize) {
    return NextResponse.json({ error: "fileName, fileUrl, fileType, fileSize are required" }, { status: 400 });
  }

  try {
    const file = await addFileToRecord(recordId, session.user.id, {
      fileName,
      fileUrl,
      fileType,
      fileSize,
    });
    return NextResponse.json({ file }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
