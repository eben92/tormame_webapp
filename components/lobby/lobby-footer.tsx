import Image from "next/image";
import Link from "next/link";
import {
  AppleIcon,
  FacebookIcon,
  GooglePlayIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons/brand-icons";
import { focusRing } from "@/components/ui/pressable";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

/**
 * The landing page's footer. A Server Component: every link is either static or
 * read from `ENV` at build time, so none of this ships as client JavaScript.
 *
 * A social icon that goes nowhere is worse than one that isn't there, so a
 * blank variable removes it. The store badges are the exception: the apps are
 * part of the pitch, so a missing listing URL turns the badge inert rather
 * than dropping it.
 */

const SOCIALS = [
  { url: ENV.FACEBOOK_URL, label: "Facebook", Icon: FacebookIcon },
  { url: ENV.INSTAGRAM_URL, label: "Instagram", Icon: InstagramIcon },
  { url: ENV.X_URL, label: "X", Icon: XIcon },
  { url: ENV.TIKTOK_URL, label: "TikTok", Icon: TikTokIcon },
  { url: ENV.LINKEDIN_URL, label: "LinkedIn", Icon: LinkedInIcon },
  { url: ENV.WHATSAPP_URL, label: "WhatsApp", Icon: WhatsAppIcon },
];

/**
 * The methods the checkout actually offers. Five carry the brand's own mark;
 * AirtelTigo publishes none we can take, so that one is its name in plain type
 * until an official asset is dropped in at the same path.
 */
const PAYMENT_METHODS = [
  { src: "/payments/mtn-momo.svg", label: "MTN Mobile Money" },
  { src: "/payments/vodafone-cash.svg", label: "Vodafone Cash" },
  { src: "/payments/airteltigo-cash.svg", label: "AirtelTigo Cash" },
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/paystack.svg", label: "Paystack" },
];

const footerLink = cn(
  "font-sans text-sm text-white/70 transition-colors hover:text-white",
  focusRing,
  "rounded-sm",
);

export function LobbyFooter() {
  const socials = SOCIALS.filter((social) => social.url);

  return (
    // The deep brand green, not `bg-foreground`: the ink colour inverts in dark
    // mode, which would leave white text on a white footer.
    <footer className="relative mt-auto overflow-hidden bg-(--splash-background) text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-10 pb-8 md:px-8 md:pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt=""
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="font-sans text-lg font-black tracking-widest">
                TORMAME
              </span>
            </span>
            <p className="max-w-xs font-sans text-sm leading-6 text-white/70">
              {STRINGS.footer.tagline}
            </p>

            {socials.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h2 className="font-sans text-xs font-bold tracking-widest text-white/50 uppercase">
                  {STRINGS.footer.followUs}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {socials.map(({ url, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={label}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full bg-white/10 text-white",
                          "transition-colors hover:bg-white/20",
                          focusRing,
                        )}
                      >
                        <Icon size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <FooterColumn title={STRINGS.footer.company}>
            <li>
              <Link href="/home" className={footerLink}>
                {STRINGS.footer.home}
              </Link>
            </li>
            <li>
              <Link href="/help" className={footerLink}>
                {STRINGS.footer.help}
              </Link>
            </li>
            <li>
              <a
                href={ENV.VENDOR_URL}
                target="_blank"
                rel="noreferrer noopener"
                className={footerLink}
              >
                {STRINGS.footer.partner}
              </a>
            </li>
          </FooterColumn>

          <FooterColumn title={STRINGS.footer.legal}>
            <li>
              <Link href="/terms" className={footerLink}>
                {STRINGS.footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={footerLink}>
                {STRINGS.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className={footerLink}>
                {STRINGS.footer.cookies}
              </Link>
            </li>
          </FooterColumn>

          <div className="flex flex-col gap-3">
            <h2 className="font-sans text-xs font-bold tracking-widest text-white/50 uppercase">
              {STRINGS.footer.getTheApp}
            </h2>
            <div className="flex flex-col gap-2.5">
              <StoreBadge
                href={ENV.IOS_APP_URL}
                label={STRINGS.footer.appStore}
                soonLabel={STRINGS.footer.appStoreSoon}
                prefix="Download on the"
                caption="App Store"
                icon={<AppleIcon size={22} />}
              />
              <StoreBadge
                href={ENV.ANDROID_APP_URL}
                label={STRINGS.footer.playStore}
                soonLabel={STRINGS.footer.playStoreSoon}
                prefix="Get it on"
                caption="Google Play"
                icon={<GooglePlayIcon size={22} />}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6">
          <h2 className="font-sans text-xs font-bold tracking-widest text-white/50 uppercase">
            {STRINGS.footer.paymentsTitle}
          </h2>
          <ul className="flex flex-wrap items-center gap-2.5">
            {PAYMENT_METHODS.map((method) => (
              <li key={method.label}>
                <Image
                  src={method.src}
                  alt={method.label}
                  title={method.label}
                  width={72}
                  height={44}
                  unoptimized
                  className="h-9 w-auto rounded-md"
                />
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 font-sans text-xs text-white/50">
          {STRINGS.footer.rights(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-sans text-xs font-bold tracking-widest text-white/50 uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

/* Both states share a frame so the pair still reads as one set of badges. */
const storeBadgeFrame =
  "flex items-center gap-3 rounded-xl border px-3.5 py-2.5";
const storeBadgePrefix = "font-sans text-[10px]";

/**
 * Our own badge rather than the platforms' artwork: Apple and Google both
 * publish badges under licences with fixed sizes, spacing and localisations.
 * Swapping the official images in here is a two-line change.
 *
 * Without an `href` the badge is a plain `span`, not a disabled control: there
 * is nothing to enable later on this page, and no affordance should suggest a
 * press that will never land.
 */
function StoreBadge({
  href,
  label,
  soonLabel,
  prefix,
  caption,
  icon,
}: {
  href: string;
  label: string;
  soonLabel: string;
  /** Each store words its own badge: "Download on the" vs "Get it on". */
  prefix: string;
  caption: string;
  icon: React.ReactNode;
}) {
  if (!href) {
    // `role="img"` with a label keeps the badge a single announced object
    // rather than loose text a reader might mistake for a link.
    return (
      <span
        role="img"
        aria-label={soonLabel}
        title={soonLabel}
        className={cn(storeBadgeFrame, "border-white/10 bg-white/5")}
      >
        {/* Opacity, not a text colour: the Play mark paints its own fills. */}
        <span className="shrink-0 text-white opacity-40">{icon}</span>
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              storeBadgePrefix,
              "font-bold tracking-widest text-white/50 uppercase",
            )}
          >
            {STRINGS.footer.comingSoon}
          </span>
          <span className="font-sans text-sm font-bold text-white/50">
            {caption}
          </span>
        </span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={cn(
        storeBadgeFrame,
        "border-white/20 bg-white/10",
        "transition-colors hover:bg-white/20",
        focusRing,
      )}
    >
      <span className="shrink-0 text-white">{icon}</span>
      <span className="flex flex-col leading-tight">
        <span className={cn(storeBadgePrefix, "text-white/60")}>{prefix}</span>
        <span className="font-sans text-sm font-bold text-white">
          {caption}
        </span>
      </span>
    </a>
  );
}
