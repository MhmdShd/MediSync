"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./form-field";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export function PasswordInput({
  id = "password",
  value,
  onChange,
  error,
  required,
  label = "Password",
  placeholder = "Enter password",
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false);

  return (
    <FormField label={label} htmlFor={id} error={error} required={required}>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 pr-10"
          aria-invalid={!!error}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </FormField>
  );
}
