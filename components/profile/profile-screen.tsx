"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CircleHelp,
  Info,
  LogOut,
  MapPin,
  MessageCircle,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { CitySheet } from "@/components/profile/city-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useLogout } from "@/lib/api/services/auth";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn, initialsFromName } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

type MenuRowProps = {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  rightNode?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

function MenuRow({
  icon,
  label,
  subtitle,
  onClick,
  rightNode,
  danger,
  disabled,
}: MenuRowProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          danger ? "bg-destructive/10" : "bg-primary-soft",
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text
          as="span"
          variant="body-strong"
          className={danger ? "text-destructive" : undefined}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text as="span" variant="body-small" className="truncate">
            {subtitle}
          </Text>
        ) : null}
      </span>
      {rightNode ?? (
        <ChevronRight size={16} className="text-muted-foreground" aria-hidden />
      )}
    </>
  );

  // A row with nothing to do on tap (e.g. app version) renders as plain text —
  // a fake tappable is worse than none.
  if (!onClick) {
    return (
      <div className="flex min-h-12 items-center gap-3 px-4 py-3.5">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={subtitle ? `${label}. ${subtitle}` : label}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 px-4 py-3.5 text-left",
        "active:bg-muted/60 hover:bg-muted/60",
        pressableScale,
        focusRing,
        disabled && "opacity-50",
      )}
    >
      {content}
    </button>
  );
}

function MenuSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {title ? (
        <Text variant="caption" className="px-4 pb-1">
          {title}
        </Text>
      ) : null}
      <div className="overflow-hidden rounded-card border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="ml-[68px] h-px bg-border" />;
}

export function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const city = useOnboardingStore((state) => state.city);
  const logout = useLogout();
  const [citySheetOpen, setCitySheetOpen] = React.useState(false);

  const profile = user?.profile;
  const name = profile?.name ?? STRINGS.profile.menu.defaultUserName;

  const handleSignOut = () => {
    logout.mutate(undefined, {
      onSettled: () => router.replace("/auth/signin"),
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-background px-4 pt-3 pb-3 md:mx-auto md:w-full md:max-w-[52rem] md:px-8 md:pt-8">
        <Text variant="h1">{STRINGS.tabs.profile}</Text>
      </div>

      <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col gap-5 px-4 pb-10 md:px-8">
        {hasHydrated && !user ? (
          <div className="overflow-hidden rounded-card bg-linear-to-br from-primary to-primary-pressed p-6">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
              <User size={30} className="text-white" aria-hidden />
            </div>
            <Text variant="h1" className="text-center text-white">
              {STRINGS.profile.menu.guestHeroTitle}
            </Text>
            <Text variant="body" className="mt-1 text-center text-white/80">
              {STRINGS.profile.menu.guestHeroSubtitle}
            </Text>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signin")}
                className="flex-1 border-white/40 bg-transparent text-white hover:bg-white/10 active:bg-white/10 active:text-white"
              >
                {STRINGS.profile.menu.signIn}
              </Button>
              <Button
                onClick={() => router.push("/auth/register")}
                className="flex-1 bg-white text-primary hover:bg-white/90 active:bg-white/90"
              >
                {STRINGS.profile.menu.createAccount}
              </Button>
            </div>
          </div>
        ) : null}

        {user ? (
          <div className="flex items-center gap-3 rounded-card border border-border bg-card p-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft font-sans text-lg font-bold text-primary">
              {initialsFromName(name) || "U"}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Text variant="h3" className="truncate">
                {name}
              </Text>
              {profile?.email ? (
                <Text variant="body-small" className="truncate">
                  {profile.email}
                </Text>
              ) : null}
              {profile?.msisdn ? (
                <Text variant="body-small" className="truncate">
                  {profile.msisdn}
                </Text>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/personal-info")}
            >
              {STRINGS.profile.menu.editProfile}
            </Button>
          </div>
        ) : null}

        <MenuSection title={STRINGS.profile.menu.discoverSectionTitle}>
          <MenuRow
            icon={<ShoppingBag size={18} className="text-primary" aria-hidden />}
            label={STRINGS.common.browseStores}
            subtitle={STRINGS.profile.menu.browseStoresSubtitle}
            onClick={() => router.push("/home")}
          />
          <Divider />
          <MenuRow
            icon={<MapPin size={18} className="text-primary" aria-hidden />}
            label={STRINGS.profile.menu.myTown}
            subtitle={city ?? STRINGS.address.chooseTown}
            onClick={() => setCitySheetOpen(true)}
          />
        </MenuSection>

        {user ? (
          <MenuSection title={STRINGS.profile.menu.myAccountSectionTitle}>
            <MenuRow
              icon={<MapPin size={18} className="text-primary" aria-hidden />}
              label={STRINGS.profile.menu.savedAddresses}
              subtitle={STRINGS.profile.menu.savedAddressesSubtitle}
              onClick={() => router.push("/addresses")}
            />
            <Divider />
            <MenuRow
              icon={<User size={18} className="text-primary" aria-hidden />}
              label={STRINGS.profile.menu.personalInfo}
              subtitle={STRINGS.profile.menu.personalInfoSubtitle}
              onClick={() => router.push("/personal-info")}
            />
          </MenuSection>
        ) : null}

        <MenuSection title={STRINGS.profile.menu.appSectionTitle}>
          <MenuRow
            icon={<Settings size={18} className="text-primary" aria-hidden />}
            label={STRINGS.profile.menu.settings}
            onClick={() => router.push("/settings")}
          />
          <Divider />
          <MenuRow
            icon={<CircleHelp size={18} className="text-primary" aria-hidden />}
            label={STRINGS.profile.menu.helpCentre}
            subtitle={STRINGS.profile.menu.helpCentreSubtitle}
            onClick={() => router.push("/help")}
          />
          <Divider />
          <MenuRow
            icon={<Info size={18} className="text-primary" aria-hidden />}
            label={STRINGS.profile.menu.aboutApp}
            rightNode={
              <Text as="span" variant="body-small">
                {STRINGS.profile.menu.versionLabel(ENV.APP_VERSION)}
              </Text>
            }
          />
        </MenuSection>

        {ENV.CONTACT_EMAIL ? (
          <MenuSection title={STRINGS.profile.menu.supportSectionTitle}>
            <MenuRow
              icon={<MessageCircle size={18} className="text-primary" aria-hidden />}
              label={STRINGS.profile.menu.contactUs}
              subtitle={STRINGS.profile.menu.contactUsSubtitle}
              onClick={() => router.push("/help")}
            />
          </MenuSection>
        ) : null}

        {user ? (
          <MenuSection>
            <MenuRow
              icon={<LogOut size={18} className="text-destructive" aria-hidden />}
              label={
                logout.isPending
                  ? STRINGS.profile.menu.signingOut
                  : STRINGS.profile.menu.signOut
              }
              danger
              disabled={logout.isPending}
              onClick={handleSignOut}
              rightNode={<span />}
            />
          </MenuSection>
        ) : null}
      </div>

      <CitySheet open={citySheetOpen} onOpenChange={setCitySheetOpen} />
    </div>
  );
}
