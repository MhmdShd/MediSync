import { NextRequest, NextResponse } from "next/server";
import { resetPasswordRequestSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/services/notification.service";

const resetCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resetPasswordRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const { phone } = parsed.data;
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    // Return success to prevent phone enumeration
    return NextResponse.json({ message: "If this number is registered, a code has been sent." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(phone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

  await notificationService.sendSms(phone, `Your MediSync password reset code is: ${code}. Expires in 10 minutes.`);

  return NextResponse.json({ message: "If this number is registered, a code has been sent." });
}
