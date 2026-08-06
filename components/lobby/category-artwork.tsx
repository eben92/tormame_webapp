"use client";

import * as React from "react";
import type { CategoryArtKey } from "@/lib/category-art";

/**
 * The category illustrations, inline rather than loaded as files, because the
 * lobby animates the drawing itself — the bun lifting off the burger, the
 * tickets separating — and you cannot reach inside an `<img>` to do that.
 *
 * Every animatable piece carries `data-part`; `ART_HOVER` below says what each
 * part does, and the tile plays it. Anything without a `data-part` is scenery.
 *
 * These are illustrations authored in-house, standing in for commissioned 3D
 * renders. A render swapped in here keeps the same contract: one square SVG per
 * vertical, parts tagged the same way.
 */

type ArtProps = { className?: string };

/**
 * Gradients are painted by document-wide id, so two copies of one drawing both
 * resolve to whichever `<defs>` comes first — and when that first copy sits in
 * a hidden subtree, the visible one paints unfilled. Scoping the ids per
 * instance removes the hazard entirely. React's ids carry colons, which a
 * `url(#…)` fragment will not resolve, so they are stripped.
 */
function useArtId() {
  const scope = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return React.useCallback((name: string) => `${scope}-${name}`, [scope]);
}

function frame(className?: string) {
  return {
    viewBox: "0 0 96 96",
    className,
    "aria-hidden": true,
    focusable: false,
  } as const;
}

/** A tween applied to every element tagged with `part`. */
export interface ArtPartTween {
  part: string;
  to: gsap.TweenVars;
  /** Timeline position, seconds. Defaults to a small stagger by index. */
  at?: number;
}

function FoodArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("food-bun-top")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6C177" />
          <stop offset="1" stopColor="#D9913C" />
        </linearGradient>
        <linearGradient id={id("food-bun-base")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8A954" />
          <stop offset="1" stopColor="#B9752B" />
        </linearGradient>
        <linearGradient id={id("food-patty")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A5333" />
          <stop offset="1" stopColor="#5C3220" />
        </linearGradient>
        <radialGradient id={id("food-shine")} cx="0.35" cy="0.25" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="80"
        rx="28"
        ry="6"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="bun-top">
        <path
          d="M18 44c0-16 13.4-26 30-26s30 10 30 26z"
          fill={`url(#${id("food-bun-top")})`}
        />
        <path
          d="M18 44c0-16 13.4-26 30-26s30 10 30 26z"
          fill={`url(#${id("food-shine")})`}
        />
        <circle cx="38" cy="30" r="1.7" fill="#FFF3DC" opacity="0.9" />
        <circle cx="52" cy="26" r="1.7" fill="#FFF3DC" opacity="0.9" />
        <circle cx="62" cy="34" r="1.7" fill="#FFF3DC" opacity="0.9" />
      </g>

      <g data-part="lettuce">
        <path d="M16 46h64a4 4 0 0 1 0 8H16a4 4 0 0 1 0-8z" fill="#63A83F" />
        <path
          d="M20 50c6-3 12 3 18 0s12 3 18 0 12 3 18 0"
          stroke="#4C8C2E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <g data-part="patty">
        <rect
          x="17"
          y="53"
          width="62"
          height="11"
          rx="5.5"
          fill={`url(#${id("food-patty")})`}
        />
        <rect
          x="17"
          y="53"
          width="62"
          height="4"
          rx="2"
          fill="#9C6440"
          opacity="0.5"
        />
      </g>

      <path
        data-part="bun-base"
        d="M22 64h52a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10z"
        fill={`url(#${id("food-bun-base")})`}
      />
    </svg>
  );
}

function GroceryArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("grocery-bag")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8C79A" />
          <stop offset="1" stopColor="#B98A54" />
        </linearGradient>
        <linearGradient id={id("grocery-apple")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2643E" />
          <stop offset="1" stopColor="#C02F1E" />
        </linearGradient>
        <linearGradient id={id("grocery-bread")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3A85C" />
          <stop offset="1" stopColor="#B4762F" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="greens">
        <path d="M30 32l7-14h5l-5 14z" fill="#4E8B34" />
        <path d="M62 32l-7-14h-5l5 14z" fill="#3F7429" />
      </g>

      <rect
        data-part="bread"
        x="45"
        y="14"
        width="13"
        height="22"
        rx="6.5"
        fill={`url(#${id("grocery-bread")})`}
        transform="rotate(20 51 25)"
      />

      <g data-part="apple">
        <circle cx="36" cy="28" r="9" fill={`url(#${id("grocery-apple")})`} />
        <path
          d="M36 19c1-3 4-4.5 6.5-3.5-1 3-3.5 4.5-6.5 3.5z"
          fill="#4E8B34"
        />
      </g>

      <g data-part="bag">
        <path
          d="M22 34h52l-4 40a6 6 0 0 1-6 5H32a6 6 0 0 1-6-5z"
          fill={`url(#${id("grocery-bag")})`}
        />
        <path d="M22 34h52l-0.9 9H22.9z" fill="#F1DCBB" />
        <path
          d="M38 46a10 10 0 0 0 20 0"
          stroke="#8E6534"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

function PharmacyArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("pharmacy-top")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FD3F5" />
          <stop offset="1" stopColor="#2E8FC4" />
        </linearGradient>
        <linearGradient id={id("pharmacy-base")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D3DEE4" />
        </linearGradient>
        <linearGradient id={id("pharmacy-cross")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ED09B" />
          <stop offset="1" stopColor="#17916A" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="24"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="capsule" transform="rotate(-38 48 46)">
        <rect
          x="20"
          y="32"
          width="56"
          height="28"
          rx="14"
          fill={`url(#${id("pharmacy-base")})`}
        />
        <path
          d="M34 32h-0.1A14 14 0 0 0 20 46a14 14 0 0 0 14 14h14V32z"
          fill={`url(#${id("pharmacy-top")})`}
        />
        <rect
          x="24"
          y="36"
          width="8"
          height="12"
          rx="4"
          fill="#FFFFFF"
          opacity="0.45"
        />
      </g>

      <g data-part="cross" transform="translate(56 54)">
        <circle cx="12" cy="12" r="14" fill={`url(#${id("pharmacy-cross")})`} />
        <path d="M9.5 5h5v4.5H19v5h-4.5V19h-5v-4.5H5v-5h4.5z" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function ElectronicsArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("electronics-body")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5C6B7A" />
          <stop offset="1" stopColor="#232C36" />
        </linearGradient>
        <linearGradient id={id("electronics-screen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#63E6C0" />
          <stop offset="1" stopColor="#1E88C7" />
        </linearGradient>
        <linearGradient id={id("electronics-bolt")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE27A" />
          <stop offset="1" stopColor="#F2A33C" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="24"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="device" transform="rotate(-10 48 46)">
        <rect
          x="27"
          y="12"
          width="42"
          height="66"
          rx="10"
          fill={`url(#${id("electronics-body")})`}
        />
        <rect
          data-part="screen"
          x="31"
          y="17"
          width="34"
          height="52"
          rx="6"
          fill={`url(#${id("electronics-screen")})`}
        />
        <rect
          x="33"
          y="19"
          width="12"
          height="26"
          rx="6"
          fill="#FFFFFF"
          opacity="0.28"
        />
        <rect
          x="41"
          y="71"
          width="14"
          height="3.5"
          rx="1.75"
          fill="#FFFFFF"
          opacity="0.35"
        />
      </g>

      <path
        data-part="bolt"
        d="M62 44l-12 17h8l-3 13 13-18h-8z"
        fill={`url(#${id("electronics-bolt")})`}
      />
    </svg>
  );
}

function FashionArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("fashion-shirt")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8FB8FF" />
          <stop offset="1" stopColor="#3C63C9" />
        </linearGradient>
        <linearGradient id={id("fashion-sleeve")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7AA5F2" />
          <stop offset="1" stopColor="#2F52AE" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <path
        data-part="shirt"
        d="M36 18l-22 12 7 14 9-4v38a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V40l9 4 7-14-22-12z"
        fill={`url(#${id("fashion-shirt")})`}
      />
      <path
        data-part="sleeve-left"
        d="M14 30l22-12 4 6-19 20z"
        fill={`url(#${id("fashion-sleeve")})`}
      />
      <path
        data-part="sleeve-right"
        d="M82 30L60 18l-4 6 19 20z"
        fill={`url(#${id("fashion-sleeve")})`}
      />
      <g data-part="collar">
        <path
          d="M36 18c3 8 21 8 24 0-4 6-20 6-24 0z"
          fill="#22397C"
          opacity="0.55"
        />
        <path
          d="M36 18c4 9 20 9 24 0"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="2"
          fill="none"
        />
      </g>
      <path
        d="M40 52c8 3 12 3 18 0"
        stroke="#FFFFFF"
        strokeOpacity="0.2"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BeautyArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("beauty-bottle")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC7DE" />
          <stop offset="1" stopColor="#D3608F" />
        </linearGradient>
        <linearGradient id={id("beauty-cap")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="1" stopColor="#D9A93F" />
        </linearGradient>
        <linearGradient id={id("beauty-lipstick")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF7B7B" />
          <stop offset="1" stopColor="#C7263F" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g data-part="bottle" transform="translate(-6 0)">
        <rect
          x="34"
          y="14"
          width="14"
          height="12"
          rx="4"
          fill={`url(#${id("beauty-cap")})`}
        />
        <rect x="38" y="24" width="6" height="8" fill="#C99B36" />
        <path
          d="M28 36a8 8 0 0 1 8-8h10a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8z"
          fill={`url(#${id("beauty-bottle")})`}
        />
        <rect
          x="33"
          y="34"
          width="7"
          height="20"
          rx="3.5"
          fill="#FFFFFF"
          opacity="0.4"
        />
      </g>

      <g data-part="lipstick" transform="translate(56 40) rotate(12)">
        <rect x="0" y="12" width="16" height="30" rx="4" fill="#3B3B45" />
        <rect x="2" y="4" width="12" height="12" rx="3" fill="#5A5A68" />
        <path d="M3 4h10v-3l-4-3-6 3z" fill={`url(#${id("beauty-lipstick")})`} />
      </g>

      <path
        data-part="sparkle"
        d="M74 18l2.4 5.6L82 26l-5.6 2.4L74 34l-2.4-5.6L66 26l5.6-2.4z"
        fill="#FFFFFF"
        opacity="0.75"
      />
    </svg>
  );
}

function EntertainmentArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient
          id={id("entertainment-front")}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#B79BFF" />
          <stop offset="1" stopColor="#6B3FD4" />
        </linearGradient>
        <linearGradient id={id("entertainment-back")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8F73F0" />
          <stop offset="1" stopColor="#4A25A8" />
        </linearGradient>
        <linearGradient id={id("entertainment-star")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE898" />
          <stop offset="1" stopColor="#F0A93A" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g transform="rotate(-12 48 48)">
        <path
          data-part="ticket-back"
          d="M18 30h60v12a6 6 0 0 0 0 12v12H18V54a6 6 0 0 0 0-12z"
          fill={`url(#${id("entertainment-back")})`}
          transform="translate(6 6)"
        />
        <g data-part="ticket-front">
          <path
            d="M14 26h60v12a6 6 0 0 0 0 12v12H14V50a6 6 0 0 0 0-12z"
            fill={`url(#${id("entertainment-front")})`}
          />
          <path
            d="M44 26v36"
            stroke="#FFFFFF"
            strokeOpacity="0.5"
            strokeWidth="2.5"
            strokeDasharray="4 5"
          />
        </g>
        <path
          data-part="star"
          d="M28 42l2.9 6.5L38 50l-5.4 4.3L34 62l-6-3.6L22 62l1.4-7.7L18 50l7.1-1.5z"
          fill={`url(#${id("entertainment-star")})`}
        />
      </g>
    </svg>
  );
}

function DigitalArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("digital-front")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4FE0B0" />
          <stop offset="1" stopColor="#0E8F79" />
        </linearGradient>
        <linearGradient id={id("digital-back")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ED8FF" />
          <stop offset="1" stopColor="#2A6FC4" />
        </linearGradient>
        <linearGradient id={id("digital-chip")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="1" stopColor="#D9A93F" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="26"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <g transform="rotate(-14 48 46)">
        <rect
          data-part="card-back"
          x="20"
          y="22"
          width="60"
          height="38"
          rx="8"
          fill={`url(#${id("digital-back")})`}
          transform="translate(4 8)"
        />
        <g data-part="card-front">
          <rect
            x="16"
            y="20"
            width="60"
            height="38"
            rx="8"
            fill={`url(#${id("digital-front")})`}
          />
          <rect
            x="16"
            y="30"
            width="60"
            height="7"
            fill="#0B6A5A"
            opacity="0.55"
          />
          <rect
            data-part="chip"
            x="23"
            y="43"
            width="13"
            height="10"
            rx="3"
            fill={`url(#${id("digital-chip")})`}
          />
          <rect
            x="42"
            y="46"
            width="26"
            height="4"
            rx="2"
            fill="#FFFFFF"
            opacity="0.55"
          />
        </g>
      </g>
    </svg>
  );
}

function DefaultArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("default-tote")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9FE7C8" />
          <stop offset="1" stopColor="#128A63" />
        </linearGradient>
      </defs>

      <ellipse
        data-part="shadow"
        cx="48"
        cy="82"
        rx="24"
        ry="5.5"
        fill="#000"
        opacity="0.18"
      />

      <path
        data-part="handle"
        d="M34 36V30a14 14 0 0 1 28 0v6"
        stroke="#0E6B4E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <g data-part="tote">
        <path
          d="M22 34h52l-4 40a6 6 0 0 1-6 5H32a6 6 0 0 1-6-5z"
          fill={`url(#${id("default-tote")})`}
        />
        <rect
          x="27"
          y="40"
          width="8"
          height="16"
          rx="4"
          fill="#FFFFFF"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}

const ART_COMPONENTS: Record<
  CategoryArtKey,
  (props: ArtProps) => React.ReactElement
> = {
  food: FoodArt,
  grocery: GroceryArt,
  pharmacy: PharmacyArt,
  electronics: ElectronicsArt,
  fashion: FashionArt,
  beauty: BeautyArt,
  entertainment: EntertainmentArt,
  digital: DigitalArt,
  default: DefaultArt,
};

/**
 * What each drawing does when the tile is hovered, focused or tapped. The
 * motion belongs to the object: a burger comes apart, a capsule turns, tickets
 * separate. Reversed on leave, and skipped entirely under reduced motion.
 */
export const ART_HOVER: Record<CategoryArtKey, ArtPartTween[]> = {
  food: [
    { part: "bun-top", to: { y: -11, rotate: -5 } },
    { part: "lettuce", to: { y: -4, x: 2 }, at: 0.04 },
    { part: "patty", to: { y: -1 }, at: 0.06 },
    { part: "bun-base", to: { y: 2 }, at: 0.06 },
    { part: "shadow", to: { scaleX: 0.9, opacity: 0.12 }, at: 0 },
  ],
  grocery: [
    { part: "apple", to: { y: -9, rotate: -10 } },
    { part: "bread", to: { y: -11, rotate: 16 }, at: 0.05 },
    { part: "greens", to: { y: -6 }, at: 0.08 },
    { part: "bag", to: { y: 2, scaleX: 1.03 }, at: 0.02 },
  ],
  pharmacy: [
    { part: "capsule", to: { rotate: 24, y: -4 } },
    { part: "cross", to: { scale: 1.18, rotate: 14 }, at: 0.08 },
  ],
  electronics: [
    { part: "device", to: { rotate: 6, y: -5 } },
    { part: "screen", to: { opacity: 0.75 }, at: 0.05 },
    { part: "bolt", to: { scale: 1.3, rotate: -10, x: 3 }, at: 0.06 },
  ],
  fashion: [
    { part: "shirt", to: { rotate: 3, y: -4 } },
    { part: "sleeve-left", to: { rotate: -10 }, at: 0.04 },
    { part: "sleeve-right", to: { rotate: 10 }, at: 0.04 },
    { part: "collar", to: { y: -2 }, at: 0.06 },
  ],
  beauty: [
    { part: "bottle", to: { y: -7, rotate: -5 } },
    { part: "lipstick", to: { y: -10, rotate: 10 }, at: 0.05 },
    { part: "sparkle", to: { rotate: 180, scale: 1.35 }, at: 0.02 },
  ],
  entertainment: [
    { part: "ticket-back", to: { x: -7, y: -3, rotate: -7 } },
    { part: "ticket-front", to: { x: 6, rotate: 5 }, at: 0.04 },
    { part: "star", to: { rotate: 200, scale: 1.2 }, at: 0.02 },
  ],
  digital: [
    { part: "card-back", to: { x: -9, y: -5, rotate: -9 } },
    { part: "card-front", to: { x: 6, y: 2, rotate: 5 }, at: 0.04 },
    { part: "chip", to: { scale: 1.2 }, at: 0.08 },
  ],
  default: [
    { part: "tote", to: { y: -7 } },
    { part: "handle", to: { y: -10, rotate: -6 }, at: 0.04 },
  ],
};

export function CategoryArtwork({
  artKey,
  className,
}: {
  artKey: CategoryArtKey;
  className?: string;
}) {
  const Art = ART_COMPONENTS[artKey];
  return <Art className={className} />;
}
