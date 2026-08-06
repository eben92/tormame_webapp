"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pill input, ported from the mobile `components/ui/input.tsx`: 48dp tall,
 * 1.5px border that turns emerald on focus, 20px horizontal padding.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-full border-[1.5px] border-input bg-card px-5",
        "font-sans text-base text-foreground placeholder:text-muted-foreground",
        "transition-colors outline-none focus:border-primary",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full min-w-0 rounded-card border-[1.5px] border-input bg-card px-4 py-3",
        "font-sans text-base text-foreground placeholder:text-muted-foreground",
        "transition-colors outline-none focus:border-primary",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

type InputWithIconProps = React.ComponentProps<"input"> & {
  icon: React.ReactNode;
  position?: "left" | "right";
};

function InputWithIcon({
  icon,
  position = "left",
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div className="relative">
      <Input
        className={cn(position === "left" ? "pl-11" : "pr-11", className)}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          position === "left" ? "left-4" : "right-4",
        )}
      >
        {icon}
      </span>
    </div>
  );
}

function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        className={cn(
          "absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center",
          "rounded-full text-muted-foreground transition-colors hover:text-foreground",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export { Input, InputWithIcon, PasswordInput, Textarea };
