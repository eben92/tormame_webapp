"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input";
import {
  PhoneInput,
  isValidGhanaPhoneNumber,
} from "@/components/ui/phone-input";
import { Text } from "@/components/ui/text";
import type { City } from "@/lib/api/schemas/catalog";
import { useCityNames, useGetCities } from "@/lib/api/services/catalog";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding";

type Step = 0 | 1 | 2;

const SUCCESS_DELAY_MS = 900;

function ProgressDots({ step }: { step: Step }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-label={STRINGS.onboarding.progressLabel(step + 1, 3)}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={step + 1}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-(--duration-base)",
            index === step ? "w-6 bg-primary" : "w-2",
            index < step ? "bg-primary" : index === step ? "" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Text variant="display">{title}</Text>
      <Text variant="body" className="text-muted-foreground">
        {subtitle}
      </Text>
    </div>
  );
}

/**
 * Town picker. A native `<select>` on purpose: every phone already knows how to
 * present one, so there is nothing new to learn and nothing to mis-scroll. No
 * border — the filled pill is the affordance, matching the rest of the app's
 * inputs.
 */
function CitySelect({
  value,
  onChange,
  initialCities,
}: {
  value: string;
  onChange: (city: string) => void;
  initialCities?: City[] | null;
}) {
  const cities = useCityNames(initialCities);
  const { isLoading } = useGetCities(initialCities);

  if (isLoading) {
    return (
      <div className="flex h-14 items-center justify-center rounded-full bg-muted">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center rounded-full bg-muted px-5">
        <Text variant="body-small" className="text-muted-foreground">
          {STRINGS.onboarding.town.loadError}
        </Text>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        aria-label={STRINGS.onboarding.town.wheelLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-14 w-full appearance-none rounded-full bg-muted pr-12 pl-5",
          "font-sans text-base font-medium text-foreground",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      >
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-primary"
      />
    </div>
  );
}

export function OnboardingScreen({
  /** City directory prerendered on the server — the wheel never starts empty. */
  initialCities,
}: {
  initialCities?: City[] | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCityOnly = searchParams.get("mode") === "city-only";

  const setCity = useOnboardingStore((state) => state.setCity);
  const setProfileDraft = useOnboardingStore((state) => state.setProfileDraft);
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );

  const cityNames = useCityNames(initialCities);
  const [step, setStep] = React.useState<Step>(0);
  const [selectedCity, setSelectedCity] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const effectiveCity = selectedCity || cityNames[0] || "";

  React.useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(
      () => router.replace(isCityOnly ? "/home" : "/lobby"),
      SUCCESS_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [showSuccess, isCityOnly, router]);

  const finish = () => {
    completeOnboarding();
    setShowSuccess(true);
  };

  const handleCityContinue = () => {
    if (!effectiveCity) return;
    setCity(effectiveCity);
    if (isCityOnly) finish();
    else setStep(1);
  };

  const handleNameContinue = (skip: boolean) => {
    if (!skip) setProfileDraft({ name });
    setStep(2);
  };

  const handlePhoneFinish = (skip: boolean) => {
    if (!skip && phone) {
      if (!isValidGhanaPhoneNumber(phone)) {
        setPhoneError(STRINGS.onboarding.phone.invalidPhoneMessage);
        return;
      }
      setProfileDraft({ phone });
    }
    finish();
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background">
        <div className="flex size-24 items-center justify-center rounded-full bg-primary">
          <Check size={44} strokeWidth={3.5} className="text-primary-foreground" aria-hidden />
        </div>
        <Text variant="h1">{STRINGS.onboarding.success.title}</Text>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pt-safe pb-safe">
      <div className="flex items-center justify-center pt-4 pb-2">
        <Image src="/logo.png" alt="" width={56} height={56} className="rounded-2xl" />
      </div>

      {!isCityOnly ? (
        <div className="py-3">
          <ProgressDots step={step} />
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[28rem] flex-1 flex-col gap-6 px-6 pt-4 pb-6">
        {step === 0 ? (
          <>
            <StepHeader
              title={STRINGS.onboarding.town.title}
              subtitle={STRINGS.onboarding.town.subtitle}
            />
            <CitySelect
              value={effectiveCity}
              onChange={setSelectedCity}
              initialCities={initialCities}
            />
            <div className="mt-auto">
              <Button
                size="lg"
                className="w-full"
                onClick={handleCityContinue}
                disabled={!effectiveCity}
              >
                {isCityOnly
                  ? STRINGS.onboarding.town.finishCta
                  : STRINGS.onboarding.town.continueCta}
              </Button>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepHeader
              title={STRINGS.onboarding.name.title}
              subtitle={STRINGS.onboarding.name.subtitle}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="onboarding-name"
                className="font-sans text-sm text-muted-foreground"
              >
                {STRINGS.onboarding.name.label}
              </label>
              <InputWithIcon
                id="onboarding-name"
                autoFocus
                autoComplete="name"
                icon={<User size={18} aria-hidden />}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={STRINGS.onboarding.name.placeholder}
              />
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => handleNameContinue(false)}
              >
                {STRINGS.onboarding.name.continueCta}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => handleNameContinue(true)}
              >
                {STRINGS.onboarding.skip}
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeader
              title={STRINGS.onboarding.phone.title}
              subtitle={STRINGS.onboarding.phone.subtitle}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="onboarding-phone"
                className="font-sans text-sm text-muted-foreground"
              >
                {STRINGS.onboarding.phone.label}
              </label>
              <PhoneInput
                id="onboarding-phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setPhoneError(null);
                }}
                aria-invalid={Boolean(phoneError)}
              />
              {phoneError ? (
                <Text variant="body-small" className="text-destructive">
                  {phoneError}
                </Text>
              ) : null}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => handlePhoneFinish(false)}
              >
                {STRINGS.onboarding.phone.finishCta}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => handlePhoneFinish(true)}
              >
                {STRINGS.onboarding.skip}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
