import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "CLINIC_ADMIN") redirect("/clinic");
    if (role === "DOCTOR") redirect("/doctor/dashboard");
    if (role === "PATIENT") redirect("/patient/dashboard");
  }

  return <LandingPage />;
}
