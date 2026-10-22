"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  UserCog,
  Calendar,
  LayoutDashboard,
  FileText,
  Settings,
  Stethoscope,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const clinicAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/clinic", icon: LayoutDashboard },
  { label: "Doctors", href: "/clinic/doctors", icon: UserCog },
  { label: "Patients", href: "/clinic/patients", icon: Users },
  { label: "Appointments", href: "/clinic/appointments", icon: Calendar },
  { label: "Settings", href: "/clinic/settings", icon: Settings },
];

const doctorNav: NavItem[] = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/doctor/patients", icon: Users },
  { label: "Schedule", href: "/doctor/schedule", icon: Calendar },
  { label: "Profile", href: "/doctor/profile", icon: Settings },
];

const patientNav: NavItem[] = [
  { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { label: "Records", href: "/patient/records", icon: FileText },
  { label: "Appointments", href: "/patient/appointments", icon: Calendar },
  { label: "Profile", href: "/patient/profile", icon: Settings },
];

function getNavItems(role: Role): NavItem[] {
  if (role === "CLINIC_ADMIN") return clinicAdminNav;
  if (role === "DOCTOR") return doctorNav;
  return patientNav;
}

interface SidebarProps {
  role: Role;
  collapsible?: boolean;
}

export function Sidebar({ role, collapsible = true }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = getNavItems(role);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b",
          collapsed ? "justify-center px-2" : "justify-between px-6"
        )}
      >
        <div className="flex items-center">
          <Stethoscope className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="ml-2 text-lg font-bold whitespace-nowrap overflow-hidden">
              MediSync
            </span>
          )}
        </div>
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center justify-center rounded-md p-1.5 text-primary-foreground bg-primary hover:bg-primary/80 transition-colors",
              collapsed && "absolute left-[18px] top-[18px]"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isRoot = item.href === "/clinic" || item.href === "/doctor/dashboard" || item.href === "/patient/dashboard";
            const isActive = isRoot
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            );

            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip content={item.label} side="right">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
