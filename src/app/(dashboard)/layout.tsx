import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { Role } from "@/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { id: string; name: string; role: Role; phone: string; image?: string; email?: string };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar role={user.role} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{
            id: user.id,
            phone: user.phone,
            name: user.name ?? "",
            role: user.role,
            avatarUrl: user.image,
            email: user.email,
          }}
          showMobileMenu
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
