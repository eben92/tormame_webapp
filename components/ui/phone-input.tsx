"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

const CALLING_CODE = "+233";

function toLocalDigits(e164: string): string {
  return e164.startsWith(CALLING_CODE)
    ? e164.slice(CALLING_CODE.length)
    : e164;
}

function stripLeadingZero(digits: string): string {
  return digits.startsWith("0") ? digits.slice(1) : digits;
}

export function isValidGhanaPhoneNumber(e164: string): boolean {
  return /^\d{9}$/.test(toLocalDigits(e164));
}

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  /** Always the E.164 value (`+233…`); the field itself shows local digits. */
  value: string;
  onChange: (e164: string) => void;
};

/**
 * Locked to Ghana — no country picker, no flag, just the fixed prefix, exactly
 * as on mobile. The caller always holds an E.164 string.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, className, disabled, ...props }, ref) {
    return (
      <div
        className={cn(
          "flex h-12 w-full items-center rounded-full border-[1.5px] border-input bg-card px-5",
          "focus-within:border-primary",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <span className="font-sans text-base text-muted-foreground">
          {CALLING_CODE}
        </span>
        <span aria-hidden className="mx-2 h-4 w-px bg-border" />
        <Input
          ref={ref}
          value={toLocalDigits(value)}
          onChange={(event) =>
            onChange(
              `${CALLING_CODE}${stripLeadingZero(event.target.value.replace(/\D/g, ""))}`,
            )
          }
          disabled={disabled}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={9}
          placeholder={STRINGS.auth.phoneDigitsPlaceholder}
          className="h-full flex-1 rounded-none border-0 bg-transparent px-0 focus:border-0"
          {...props}
        />
      </div>
    );
  },
);
