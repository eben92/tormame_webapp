"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * The drawings for empty and error screens — same square frame, layered
 * gradients and cast shadow as `components/lobby/category-artwork`, so a dead
 * end looks like it belongs to the same product as the landing page.
 *
 * There are fewer drawings than there are situations, on purpose: "no stores in
 * this city", "no stores in this category" and "this shop has nothing listed"
 * are one picture because they are one thought. `EmptyArtKey` names the
 * picture, not the screen.
 *
 * Every animatable piece carries `data-part`; `EMPTY_ART_IDLE` says what each
 * one does, and `EmptyArtwork` plays it. Anything without a `data-part` is
 * scenery. Two parts are required of every drawing — `body` and `shadow` —
 * because the float that lifts the art off the page is applied to all of them.
 */

/**
 * | key         | used for                                                   |
 * | ----------- | ---------------------------------------------------------- |
 * | `basket`    | empty cart at checkout                                      |
 * | `orders`    | no orders yet, whether signed out or a new account          |
 * | `search`    | no search results; a shop we could not find                 |
 * | `addresses` | no saved addresses                                          |
 * | `stores`    | nothing listed here — a city, a category, or a shop's menu  |
 * | `offline`   | the request never left the device                           |
 * | `server`    | the request failed on our side                              |
 */
export type EmptyArtKey =
  | "basket"
  | "orders"
  | "search"
  | "addresses"
  | "stores"
  | "offline"
  | "server";

type ArtProps = { className?: string };

/** A looping tween applied to every element tagged with `part`. */
export interface ArtIdleTween {
  part: string;
  to: gsap.TweenVars;
  /** Set for two-sided motion — a swing has to start off-centre to have one. */
  from?: gsap.TweenVars;
  duration: number;
  /** Keeps parts off each other's clock, so the drawing never pulses as one. */
  delay?: number;
  /** For motion that plays out and rests, rather than breathing. */
  repeatDelay?: number;
  yoyo?: boolean;
  ease?: string;
}

function frame(className?: string) {
  return {
    viewBox: "0 0 96 96",
    className,
    "aria-hidden": true,
    focusable: false,
  } as const;
}

/**
 * `url(#id)` resolves against the document, not the SVG, so two copies of one
 * drawing on a page would both paint from whichever `<defs>` rendered last.
 * Every id is namespaced per instance to keep them apart. React's ids carry
 * colons, which a fragment url will not resolve, so those are stripped.
 */
function useArtId() {
  const scope = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (name: string) => `ea-${scope}-${name}`;
}

function BasketArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("bag")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9FE7C8" />
          <stop offset="1" stopColor="#0F7C58" />
        </linearGradient>
        <linearGradient id={id("mouth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7BD8B4" />
          <stop offset="1" stopColor="#2C9A74" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="84"
        rx="25"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <g data-part="sway">
          <g transform="rotate(-4 48 54)">
            <path
              d="M32 34V25a16 16 0 0 1 32 0v9"
              stroke="#0B5B41"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M22 34h52l-2.5 40a6 6 0 0 1-6 5H30.5a6 6 0 0 1-6-5z"
              fill={`url(#${id("bag")})`}
            />
            {/* The mouth is open and the inside is drawn: the whole point of
                the picture is that you can see there is nothing in it. */}
            <ellipse
              cx="48"
              cy="34"
              rx="26"
              ry="6.5"
              fill={`url(#${id("mouth")})`}
            />
            <ellipse cx="48" cy="35" rx="20" ry="4.4" fill="#0A4E38" />
            <ellipse cx="48" cy="34.2" rx="20" ry="4.4" fill="#073827" />
            <rect
              x="29"
              y="45"
              width="8"
              height="18"
              rx="4"
              fill="#FFFFFF"
              opacity="0.32"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

function OrdersArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("lid")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4E0C0" />
          <stop offset="1" stopColor="#DCBB8B" />
        </linearGradient>
        <linearGradient id={id("tag")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7BD8B4" />
          <stop offset="1" stopColor="#0F7C58" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="84"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        {/* Three tones on three faces is the whole trick: the box reads as a
            solid before any shading is added to it. */}
        <path d="M22 37L48 50v28L22 65z" fill="#C69A62" />
        <path d="M74 37L48 50v28l26-13z" fill="#A87A45" />
        <path d="M48 24l26 13-26 13-26-13z" fill={`url(#${id("lid")})`} />

        <path d="M33.7 27.8l26 13 2.6 5.4-26-13z" fill="#E8A954" />
        <path d="M32.4 42.2l6 3v28l-6-3z" fill="#C98F3F" />

        <path d="M56 53l12-6v10l-12 6z" fill="#FFFFFF" opacity="0.85" />
        <path d="M58 56l8-4v1.8l-8 4z" fill="#8A6A3C" opacity="0.55" />
        <path d="M58 59.4l5-2.5v1.8l-5 2.5z" fill="#8A6A3C" opacity="0.4" />

        {/* Hung off the near corner into clear space, where it can swing
            without reading as something stuck to the box. */}
        <g data-part="tag">
          <path d="M22 37l-3 10" stroke="#8A6A3C" strokeWidth="1.8" />
          <rect
            x="12"
            y="47"
            width="14"
            height="10"
            rx="3"
            fill={`url(#${id("tag")})`}
          />
          <circle cx="15.5" cy="50" r="1.4" fill="#FFFFFF" opacity="0.85" />
          <rect
            x="18"
            y="49.2"
            width="6"
            height="1.8"
            rx="0.9"
            fill="#FFFFFF"
            opacity="0.6"
          />
          <rect
            x="18"
            y="53"
            width="4"
            height="1.8"
            rx="0.9"
            fill="#FFFFFF"
            opacity="0.4"
          />
        </g>
      </g>
    </svg>
  );
}

function SearchArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("paper")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#C4D2DB" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFEEFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#63B7E3" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#57D3AC" />
          <stop offset="1" stopColor="#0B6B4E" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="84"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <g transform="rotate(-7 42 48)">
          <rect
            x="18"
            y="24"
            width="46"
            height="48"
            rx="8"
            fill={`url(#${id("paper")})`}
          />
          <rect x="25" y="33" width="24" height="5" rx="2.5" fill="#AFC0C9" />
          <rect x="25" y="45" width="32" height="4" rx="2" fill="#CBD6DD" />
          <rect x="25" y="54" width="20" height="4" rx="2" fill="#CBD6DD" />
        </g>

        <g data-part="lens">
          <path
            d="M65 60l12 12"
            stroke="#0B5B41"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <circle cx="54" cy="48" r="16" fill={`url(#${id("glass")})`} />
          <circle
            cx="54"
            cy="48"
            r="16"
            fill="none"
            stroke={`url(#${id("rim")})`}
            strokeWidth="5"
          />
          <path
            data-part="glint"
            d="M46 42a11 11 0 0 1 8-5"
            stroke="#FFFFFF"
            strokeOpacity="0.85"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}

function AddressesArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("plate")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3E2C4" />
          <stop offset="1" stopColor="#D6B584" />
        </linearGradient>
        <linearGradient id={id("pin")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5FDCB2" />
          <stop offset="1" stopColor="#0B6B4E" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="86"
        rx="26"
        ry="5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <path d="M16 58l32 18 32-18v4L48 80 16 62z" fill="#AE8B5B" />
        <path d="M48 40l32 18-32 18-32-18z" fill={`url(#${id("plate")})`} />
        <path
          d="M30 57l12-7 14 14 14-8"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeDasharray="5 4"
          strokeLinecap="round"
          fill="none"
        />

        <ellipse
          data-part="ripple"
          cx="48"
          cy="58"
          rx="11"
          ry="5.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.55"
        />

        <g data-part="pin">
          <path
            d="M48 20c-7.7 0-14 6.3-14 14 0 10.5 14 24 14 24s14-13.5 14-24c0-7.7-6.3-14-14-14z"
            fill={`url(#${id("pin")})`}
          />
          <path
            d="M40 27a11 11 0 0 1 7-4"
            stroke="#FFFFFF"
            strokeOpacity="0.4"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="48" cy="34" r="5.4" fill="#FFFFFF" opacity="0.92" />
        </g>
      </g>
    </svg>
  );
}

function StoresArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5E8D5" />
          <stop offset="1" stopColor="#D4BE9F" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F5148" />
          <stop offset="1" stopColor="#14302A" />
        </linearGradient>
        <linearGradient id={id("awning")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FC393" />
          <stop offset="1" stopColor="#0B6B4E" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="84"
        rx="27"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <rect
          x="18"
          y="34"
          width="60"
          height="46"
          rx="5"
          fill={`url(#${id("wall")})`}
        />
        <rect
          x="25"
          y="44"
          width="46"
          height="36"
          rx="3"
          fill={`url(#${id("glass")})`}
        />
        {/* Shelves with nothing on them — the reason this drawing exists. */}
        <rect
          x="30"
          y="64"
          width="36"
          height="3"
          rx="1.5"
          fill="#FFFFFF"
          opacity="0.26"
        />
        <rect
          x="30"
          y="73"
          width="36"
          height="3"
          rx="1.5"
          fill="#FFFFFF"
          opacity="0.16"
        />

        <g data-part="sign">
          <path d="M48 44v5" stroke="#FFFFFF" strokeOpacity="0.45" />
          <rect x="38" y="49" width="20" height="11" rx="3" fill="#F1E4D1" />
          <rect x="42" y="54" width="12" height="2" rx="1" fill="#A9B3AD" />
        </g>

        <g data-part="awning">
          <path d="M14 34l4-13h60l4 13z" fill={`url(#${id("awning")})`} />
          <path
            d="M22 21h10l-2.1 13H18.5z"
            fill="#FFFFFF"
            opacity="0.45"
          />
          <path d="M42 21h10l0.5 13H41.2z" fill="#FFFFFF" opacity="0.45" />
          <path d="M62 21h10l3.2 13H63.9z" fill="#FFFFFF" opacity="0.45" />
          <rect x="12" y="32" width="72" height="4.5" rx="2.25" fill="#0A5B42" />
        </g>
      </g>
    </svg>
  );
}

function OfflineArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        {/* One ramp in user space, or the overlapping circles each get their
            own and the cloud comes apart along the seams. */}
        <linearGradient
          id={id("cloud")}
          gradientUnits="userSpaceOnUse"
          x1="24"
          y1="18"
          x2="78"
          y2="60"
        >
          <stop offset="0" stopColor="#EAF2F8" />
          <stop offset="1" stopColor="#8FA6B9" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="50"
        cy="87"
        rx="21"
        ry="5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <g data-part="cloud">
          <g fill={`url(#${id("cloud")})`}>
            <circle cx="36" cy="41" r="14" />
            <circle cx="55" cy="32" r="18" />
            <circle cx="69" cy="44" r="12" />
            <rect x="32" y="42" width="38" height="15" rx="7.5" />
          </g>
          <path
            d="M31 37a14 14 0 0 1 15-9"
            stroke="#FFFFFF"
            strokeOpacity="0.5"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Unplugged and hanging: the cable is the whole sentence. */}
        <g data-part="plug">
          <path
            d="M52 54v9"
            stroke="#6E8394"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="45" y="62" width="15" height="13" rx="4.5" fill="#4E5F6E" />
          <rect
            x="47.6"
            y="64.5"
            width="3.4"
            height="6"
            rx="1.7"
            fill="#FFFFFF"
            opacity="0.3"
          />
          <rect x="48.2" y="75" width="2.8" height="4.5" rx="1.4" fill="#C7CFD6" />
          <rect x="54" y="75" width="2.8" height="4.5" rx="1.4" fill="#C7CFD6" />
        </g>
      </g>
    </svg>
  );
}

function ServerArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("unit")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#667686" />
          <stop offset="1" stopColor="#232C36" />
        </linearGradient>
        <linearGradient id={id("alert")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF9068" />
          <stop offset="1" stopColor="#BE2018" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="86"
        rx="26"
        ry="5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="body">
        <rect
          x="20"
          y="50"
          width="56"
          height="16"
          rx="5"
          fill={`url(#${id("unit")})`}
        />
        <rect
          x="20"
          y="69"
          width="56"
          height="15"
          rx="5"
          fill={`url(#${id("unit")})`}
        />
        <rect
          x="27"
          y="55"
          width="16"
          height="2.6"
          rx="1.3"
          fill="#FFFFFF"
          opacity="0.22"
        />
        <rect
          x="27"
          y="60"
          width="11"
          height="2.6"
          rx="1.3"
          fill="#FFFFFF"
          opacity="0.14"
        />
        <rect
          x="27"
          y="74"
          width="16"
          height="2.6"
          rx="1.3"
          fill="#FFFFFF"
          opacity="0.18"
        />
        <circle data-part="led" cx="67" cy="58" r="2.8" fill="#FF6B4A" />
        <circle cx="67" cy="76.5" r="2.8" fill="#FF6B4A" opacity="0.4" />

        <g data-part="alert">
          {/* Stroked in its own fill so the corners round off — a hard-cornered
              triangle is the one shape that would look drawn by a machine. */}
          <path
            d="M48 17l15 27H33z"
            fill={`url(#${id("alert")})`}
            stroke={`url(#${id("alert")})`}
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <rect x="45.6" y="26" width="4.8" height="10" rx="2.4" fill="#FFFFFF" />
          <circle cx="48" cy="40" r="2.5" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}

const EMPTY_ART_COMPONENTS: Record<
  EmptyArtKey,
  (props: ArtProps) => React.ReactElement
> = {
  basket: BasketArt,
  orders: OrdersArt,
  search: SearchArt,
  addresses: AddressesArt,
  stores: StoresArt,
  offline: OfflineArt,
  server: ServerArt,
};

/**
 * What each drawing does while it sits there. On top of the float and shadow
 * that every drawing gets, one part does something characterful — a magnifier
 * sweeps the blank card, a parcel's tag swings.
 *
 * Deliberately slow and off-beat from each other: this lives under a sentence
 * someone is reading, and anything that pulses in time reads as a spinner.
 */
export const EMPTY_ART_IDLE: Record<EmptyArtKey, ArtIdleTween[]> = {
  basket: [
    {
      part: "sway",
      from: { rotation: -2.4 },
      to: { rotation: 2.4, transformOrigin: "50% 0%" },
      duration: 3.8,
    },
  ],
  orders: [
    {
      part: "tag",
      from: { rotation: -7 },
      // Pivots on the box corner the string is tied to, not the tag's middle.
      to: { rotation: 7, transformOrigin: "71% 0%" },
      duration: 2.6,
    },
  ],
  search: [
    { part: "lens", from: { x: -6 }, to: { x: 6, y: -1.5 }, duration: 3.4 },
    { part: "glint", to: { opacity: 0.35 }, duration: 2.2, delay: 0.5 },
  ],
  addresses: [
    { part: "pin", to: { y: -5 }, duration: 2.9 },
    {
      part: "ripple",
      from: { scale: 0.8, opacity: 0.55 },
      to: { scale: 1.7, opacity: 0, transformOrigin: "50% 50%" },
      duration: 2.4,
      repeatDelay: 1.2,
      yoyo: false,
      ease: "power2.out",
    },
  ],
  stores: [
    {
      part: "sign",
      from: { rotation: -5 },
      to: { rotation: 5, transformOrigin: "50% 0%" },
      duration: 2.9,
    },
    {
      part: "awning",
      to: { scaleY: 0.97, transformOrigin: "50% 0%" },
      duration: 3.3,
      delay: 0.4,
    },
  ],
  offline: [
    { part: "cloud", from: { x: -2.5 }, to: { x: 2.5 }, duration: 4.2 },
    {
      part: "plug",
      from: { rotation: -9 },
      to: { rotation: 9, transformOrigin: "46% 0%" },
      duration: 2.7,
    },
  ],
  server: [
    {
      part: "alert",
      to: { scale: 1.07, transformOrigin: "50% 50%" },
      duration: 2.6,
    },
    { part: "led", to: { opacity: 0.3 }, duration: 2.1, delay: 0.4 },
  ],
};

/**
 * The drawing plus its ambient motion. Sized by the caller, since an empty
 * screen and an inline error give it different amounts of room.
 */
export function EmptyArtwork({
  artKey,
  className,
}: {
  artKey: EmptyArtKey;
  className?: string;
}) {
  const Art = EMPTY_ART_COMPONENTS[artKey];
  const stage = React.useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to('[data-part="body"]', {
        y: -3.5,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      // The shadow answers the float, which is what makes the drawing read as
      // lifting rather than sliding.
      gsap.to('[data-part="shadow"]', {
        scaleX: 0.9,
        opacity: 0.11,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 50%",
      });

      EMPTY_ART_IDLE[artKey].forEach(
        ({ part, from, to, duration, delay, repeatDelay, yoyo, ease }) => {
          const targets = stage.current?.querySelectorAll(
            `[data-part="${part}"]`,
          );
          if (!targets?.length) return;

          const vars: gsap.TweenVars = {
            ...to,
            duration,
            delay: delay ?? 0,
            repeat: -1,
            repeatDelay: repeatDelay ?? 0,
            yoyo: yoyo ?? true,
            ease: ease ?? "sine.inOut",
          };

          if (from) gsap.fromTo(targets, from, vars);
          else gsap.to(targets, vars);
        },
      );
    },
    { scope: stage, dependencies: [artKey] },
  );

  return (
    <span ref={stage} aria-hidden className={cn("block", className)}>
      <Art className="size-full overflow-visible drop-shadow-[0_10px_16px_rgb(0_0_0/0.14)]" />
    </span>
  );
}
