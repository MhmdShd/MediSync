"use client";

import * as React from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Clinic {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface ClinicSwitcherProps {
  clinics: Clinic[];
  selectedClinicId?: string;
  onSelect: (clinicId: string | undefined) => void;
}

export function ClinicSwitcher({ clinics, selectedClinicId, onSelect }: ClinicSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const selected = clinics.find((c) => c.id === selectedClinicId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Building2 className="h-4 w-4" />
        <span>{selected?.name ?? "All Clinics"}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-background shadow-md"
          role="listbox"
        >
          <button
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
              !selectedClinicId && "font-medium"
            )}
            onClick={() => { onSelect(undefined); setOpen(false); }}
            role="option"
            aria-selected={!selectedClinicId}
          >
            {!selectedClinicId && <Check className="h-3 w-3" />}
            <span className={!selectedClinicId ? "" : "ml-5"}>All Clinics</span>
          </button>
          {clinics.map((clinic) => (
            <button
              key={clinic.id}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                selectedClinicId === clinic.id && "font-medium"
              )}
              onClick={() => { onSelect(clinic.id); setOpen(false); }}
              role="option"
              aria-selected={selectedClinicId === clinic.id}
            >
              {selectedClinicId === clinic.id ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="w-3" />
              )}
              {clinic.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
