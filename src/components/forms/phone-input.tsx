"use client";

import * as React from "react";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import { COUNTRY_CODES } from "@/lib/country-codes";
import Flag from "react-flagkit";
import { ChevronDown } from "lucide-react";

// ISO → dial code mapping for geolocation fallback
const ISO_TO_DIAL: Record<string, string> = {};
for (const c of COUNTRY_CODES) {
  ISO_TO_DIAL[c.iso.toUpperCase()] = c.code;
}

function detectDialCodeFromPhone(full: string): string {
  if (!full || !full.startsWith("+")) return "+964";
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  const match = sorted.find((c) => full.startsWith(c.code));
  return match?.code ?? "+964";
}

function getFlagIso(dialCode: string): string {
  const match = COUNTRY_CODES.find((c) => c.code === dialCode);
  return match?.iso ?? "iq";
}

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  label?: string;
}

export function PhoneInput({
  id = "phone",
  value,
  onChange,
  error,
  required,
  label = "Phone Number",
}: PhoneInputProps) {
  const [dialCode, setDialCode] = React.useState("+964");
  const [local, setLocal] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const dialInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-detect country from browser locale on mount
  React.useEffect(() => {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      const country = locale.split("-")[1]?.toUpperCase();
      if (country && ISO_TO_DIAL[country]) {
        setDialCode(ISO_TO_DIAL[country]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync external value → internal state
  React.useEffect(() => {
    if (!value) {
      setLocal("");
      return;
    }
    const detected = detectDialCodeFromPhone(value);
    if (value.startsWith(detected)) {
      setDialCode(detected);
      setLocal(value.slice(detected.length).replace(/\D/g, ""));
    } else if (value.startsWith("+")) {
      setDialCode(detected);
      setLocal(value.slice(1).replace(/\D/g, ""));
    } else {
      setLocal(value.replace(/\D/g, ""));
    }
  }, [value]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9+]/g, "");
    if (!val.startsWith("+")) val = "+" + val.replace(/\+/g, "");
    setDialCode(val);
    onChange(val + local);
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setLocal(digits);
    onChange(dialCode + digits);
  };

  const handleDialSelect = (code: string) => {
    setDialCode(code);
    setShowDropdown(false);
    onChange(code + local);
    // Focus the dial input after selection
    setTimeout(() => dialInputRef.current?.focus(), 0);
  };

  const flagIso = getFlagIso(dialCode);

  return (
    <FormField label={label} htmlFor={id} error={error} required={required}>
      <div className="flex gap-2">
        {/* Flag dropdown + editable dial code */}
        <div className="relative flex items-center gap-1 rounded-md border border-input bg-card px-2 py-1 shadow-sm focus-within:ring-1 focus-within:ring-ring" ref={dropdownRef}>
          {/* Flag button — opens dropdown */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 select-none shrink-0"
            tabIndex={-1}
          >
            <Flag country={flagIso.toUpperCase()} size={20} />
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Editable dial code */}
          <input
            ref={dialInputRef}
            type="text"
            value={dialCode}
            onChange={handleDialChange}
            className="w-[52px] bg-transparent text-sm font-medium outline-none"
          />

          {/* Country dropdown */}
          {showDropdown && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-56 overflow-y-auto rounded-md border bg-popover shadow-md">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleDialSelect(c.code)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                    dialCode === c.code && "bg-accent"
                  )}
                >
                  <Flag country={c.iso.toUpperCase()} size={18} />
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          id={id}
          type="tel"
          value={local}
          onChange={handleLocalChange}
          placeholder="7701234567"
          aria-invalid={!!error}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm",
            "transition-colors placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
    </FormField>
  );
}
