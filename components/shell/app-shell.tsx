"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { AddressButton } from "@/components/shell/address-button";
import { GlobalCartBar } from "@/components/shared/global-cart-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { focusRing } from "@/components/ui/pressable";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";

const TABS = [
  { href: "/home", label: STRINGS.tabs.home, Icon: LayoutGrid },
  { href: "/explore", label: STRINGS.tabs.explore, Icon: Compass },
  { href: "/orders", label: STRINGS.tabs.orders, Icon: ShoppingBag },
  { href: "/profile", label: STRINGS.tabs.profile, Icon: User },
] as const;

function isActiveTab(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed bottom tab bar — the mobile app's primary navigation, 64px + safe area. */
function TabBar() {
  const pathname = usePathname();

  // The native app only shows tabs on the four tab screens; anything pushed on
  // top of them (shop, checkout, order details…) is a full-screen stack screen.
  if (!TABS.some((tab) => isActiveTab(pathname, tab.href))) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-safe md:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActiveTab(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-12 flex-col items-center justify-center gap-1 pt-2",
                  focusRing,
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon
                  size={20}
                  className={active ? "fill-primary/15" : undefined}
                  aria-hidden
                />
                <span className="font-sans text-xs font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sticky marketplace header — desktop's replacement for the tab bar. */
function DesktopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [query, setQuery] = React.useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
  };

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card md:block">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1280px] items-center gap-6 px-8">
        <Link
          href="/home"
          className={cn("flex shrink-0 items-center gap-2", focusRing)}
          aria-label="TORMAME"
        >
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="font-sans text-lg font-black tracking-widest text-foreground">
            TORMAME
          </span>
        </Link>

        <AddressButton variant="pill" className="max-w-[18rem]" />

        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={STRINGS.explore.searchPlaceholder}
            aria-label={STRINGS.explore.searchLabel}
            className="pl-11"
          />
        </form>

        <nav aria-label="Primary" className="flex shrink-0 items-center gap-1">
          {TABS.filter((tab) => tab.href !== "/home").map(
            ({ href, label, Icon }) => {
              const active = isActiveTab(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-2 rounded-full px-4 font-sans text-sm font-medium",
                    focusRing,
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-body hover:bg-muted",
                  )}
                >
                  <Icon size={18} aria-hidden />
                  {label}
                </Link>
              );
            },
          )}
          {!user ? (
            <Button size="sm" onClick={() => router.push("/auth/signin")}>
              {STRINGS.lobby.signIn}
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

/**
 * The authenticated app frame: bottom tabs on mobile (identical to the native
 * tab bar), a sticky marketplace header on desktop.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasTabBar = TABS.some((tab) => isActiveTab(pathname, tab.href));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DesktopHeader />
      <div className={cn("flex flex-1 flex-col", hasTabBar && "pb-16 md:pb-0")}>
        {children}
      </div>
      <GlobalCartBar />
      <TabBar />
    </div>
  );
}
