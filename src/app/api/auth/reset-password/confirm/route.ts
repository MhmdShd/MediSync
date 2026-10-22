import { NextRequest, NextResponse } from "next/server";
import { resetPasswordConfirmSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

const resetCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resetPasswordConfirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { phone, code, newPassword } = parsed.data;

  const stored = resetCodes.get(phone);
  if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({ where: { phone }, data: { passwordHash } });

  resetCodes.delete(phone);

  return NextResponse.json({ message: "Password updated successfully" });
}
