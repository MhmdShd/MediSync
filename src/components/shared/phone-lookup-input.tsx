"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRY_CODES } from "@/lib/country-codes";
import Flag from "react-flagkit";

// ISO → dial code mapping for geolocation fallback
const ISO_TO_DIAL: Record<string, string> = {};
for (const c of COUNTRY_CODES) {
  ISO_TO_DIAL[c.iso.toUpperCase()] = c.code;
}

function getFlagIso(dialCode: string): string {
  const match = COUNTRY_CODES.find((c) => c.code === dialCode);
  return match?.iso ?? "iq";
}

interface PhoneLookupResult {
  id: string;
  name: string;
  phone: string;
  alreadyLinked: boolean;
}

interface PhoneLookupInputProps {
  onSearch: (phone: string) => Promise<PhoneLookupResult[]>;
  onSelect: (result: PhoneLookupResult) => void;
  onCreateNew?: (phone: string) => void;
  className?: string;
}

export function PhoneLookupInput({
  onSearch,
  onSelect,
  onCreateNew,
  className,
}: PhoneLookupInputProps) {
  const [dialCode, setDialCode] = React.useState("+964");
  const [local, setLocal] = React.useState("");
  const [results, setResults] = React.useState<PhoneLookupResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fullPhone = dialCode + local.replace(/\D/g, "");

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

  const handleSearch = async () => {
    if (local.replace(/\D/g, "").length < 7) return;
    setLoading(true);
    setSearched(false);
    try {
      const found = await onSearch(fullPhone);
      setResults(found);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); void handleSearch(); }
  };

  const handleDialSelect = (code: string) => {
    setDialCode(code);
    setShowDropdown(false);
    setSearched(false);
  };

  const flagIso = getFlagIso(dialCode);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        {/* Flag + dial code — clickable dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "min-w-[100px] select-none"
            )}
          >
            <Flag country={flagIso.toUpperCase()} size={20} />
            <span className="text-xs font-medium">{dialCode}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showDropdown && (
            <div className="absolute z-50 mt-1 max-h-60 w-56 overflow-y-auto rounded-md border bg-popover shadow-md">
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

        <input
          type="tel"
          value={local}
          onChange={(e) => { setLocal(e.target.value.replace(/\D/g, "")); setSearched(false); }}
          onKeyDown={handleKeyDown}
          placeholder="7701234567"
          aria-label="Phone number"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={loading || local.replace(/\D/g, "").length < 7}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline">Search</span>
        </Button>
      </div>

      {searched && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">No existing profile found for this number.</p>
              {onCreateNew && (
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => onCreateNew(fullPhone)}>
                  Create new profile
                </Button>
              )}
            </div>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "flex items-center justify-between rounded-md border p-3",
                  result.alreadyLinked && "opacity-60"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{result.name}</p>
                  <p className="text-xs text-muted-foreground">{result.phone}</p>
                  {result.alreadyLinked && (
                    <p className="text-xs text-amber-600">Already linked to this clinic</p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={result.alreadyLinked}
                  onClick={() => onSelect(result)}
                >
                  {result.alreadyLinked ? "Linked" : "Select"}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
