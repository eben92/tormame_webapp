"use client";

import * as React from "react";

/**
 * The drawings for the partners page, in the same language as
 * `components/lobby/category-artwork`: one square frame, layered gradients, a
 * cast shadow, and every moving piece tagged with `data-part` so the page can
 * animate the drawing rather than fade a flat picture in.
 *
 * They are illustrations rather than photographs on purpose. A stock photo of a
 * smiling stranger in a foreign kitchen tells a shop owner in Nkawkaw nothing;
 * a drawing of a counter, a phone and a bag of food is the thing itself.
 */

export type PartnerArtKey =
  | "storefront"
  | "orders"
  | "handover"
  | "wallet"
  | "growth";

type ArtProps = { className?: string };

/**
 * `url(#id)` resolves against the document, not the SVG, so two copies of one
 * drawing would both paint from whichever `<defs>` rendered first. Ids are
 * namespaced per instance. React's ids carry colons, which a fragment url will
 * not resolve, so those are stripped.
 */
function useArtId() {
  const scope = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return React.useCallback((name: string) => `pa-${scope}-${name}`, [scope]);
}

function frame(className?: string) {
  return {
    viewBox: "0 0 96 96",
    className,
    "aria-hidden": true,
    focusable: false,
  } as const;
}

function Shadow() {
  return (
    <ellipse
      data-part="shadow"
      cx="48"
      cy="84"
      rx="30"
      ry="5.5"
      fill="#000"
      opacity="0.16"
    />
  );
}

/** A shop with its shutter up: the thing the vendor already owns. */
function StorefrontArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F3E8" />
          <stop offset="1" stopColor="#E4DCC7" />
        </linearGradient>
        <linearGradient id={id("awning")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F7A57" />
          <stop offset="1" stopColor="#07553C" />
        </linearGradient>
        <linearGradient id={id("door")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A6B52" />
          <stop offset="1" stopColor="#12432F" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#BFE6D5" />
          <stop offset="1" stopColor="#8CC7AF" />
        </linearGradient>
      </defs>

      <Shadow />

      {/* The shop fills the frame: an illustration with a third of its box
          empty reads as a layout gap wherever it is placed. */}
      <g data-part="body">
        <rect x="14" y="14" width="68" height="64" rx="5" fill={`url(#${id("wall")})`} />
        <rect x="12" y="74" width="72" height="5" rx="2.5" fill="#CFC4A9" />

        {/* The board over the door, where a shop paints its name. */}
        <g data-part="sign">
          <rect x="22" y="20" width="52" height="11" rx="5.5" fill="#0F7A57" />
          <circle cx="30" cy="25.5" r="2.4" fill="#F7F3E8" />
          <rect x="36" y="24" width="30" height="3" rx="1.5" fill="#F7F3E8" opacity="0.85" />
        </g>

        <g data-part="awning">
          <path d="M10 36h76l-3 11H13z" fill={`url(#${id("awning")})`} />
          <path d="M21 47l2-11h9l-2 11z" fill="#F7F3E8" opacity="0.9" />
          <path d="M44 47l2-11h9l-2 11z" fill="#F7F3E8" opacity="0.9" />
          <path d="M67 47l2-11h9l-2 11z" fill="#F7F3E8" opacity="0.9" />
          <path d="M13 47h70" stroke="#06412E" strokeWidth="1.5" opacity="0.35" />
        </g>

        <rect x="21" y="53" width="26" height="17" rx="3" fill={`url(#${id("glass")})`} />
        <path d="M21 61.5h26" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.6" />

        <rect x="54" y="53" width="20" height="21" rx="3" fill={`url(#${id("door")})`} />
        <circle cx="58.5" cy="63" r="1.7" fill="#F7F3E8" opacity="0.9" />
      </g>
    </svg>
  );
}

/** A phone with an order coming in, and the counter's tally beside it. */
function OrdersArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("phone")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14503B" />
          <stop offset="1" stopColor="#0A3125" />
        </linearGradient>
        <linearGradient id={id("screen")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F3E8" />
          <stop offset="1" stopColor="#DCEFE5" />
        </linearGradient>
      </defs>

      <Shadow />

      <g data-part="body">
        <rect x="30" y="16" width="36" height="62" rx="8" fill={`url(#${id("phone")})`} />
        <rect x="34" y="22" width="28" height="50" rx="4" fill={`url(#${id("screen")})`} />
        <rect x="43" y="18.5" width="10" height="2" rx="1" fill="#F7F3E8" opacity="0.5" />

        <rect x="38" y="34" width="20" height="3" rx="1.5" fill="#0F7A57" opacity="0.85" />
        <rect x="38" y="41" width="14" height="2.5" rx="1.25" fill="#8AA79A" />
        <rect x="38" y="47" width="17" height="2.5" rx="1.25" fill="#8AA79A" />
        <rect x="38" y="58" width="20" height="8" rx="4" fill="#0F7A57" />
      </g>

      <g data-part="ping">
        <circle cx="66" cy="24" r="8" fill="#F59E0B" />
        <rect x="65" y="20" width="2" height="5" rx="1" fill="#3A2508" />
        <circle cx="66" cy="28" r="1.3" fill="#3A2508" />
      </g>

      <g data-part="tally">
        <rect x="14" y="52" width="12" height="4" rx="2" fill="#0F7A57" opacity="0.55" />
        <rect x="14" y="60" width="12" height="4" rx="2" fill="#0F7A57" opacity="0.4" />
        <rect x="14" y="68" width="12" height="4" rx="2" fill="#0F7A57" opacity="0.25" />
      </g>
    </svg>
  );
}

/** The handover: a bag, and the code the customer reads out. */
function HandoverArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("bag")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8C89A" />
          <stop offset="1" stopColor="#C79B60" />
        </linearGradient>
        <linearGradient id={id("chip")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0F7A57" />
          <stop offset="1" stopColor="#0A5A3F" />
        </linearGradient>
      </defs>

      <Shadow />

      <g data-part="body">
        <path
          d="M26 40h44l-4 38a4 4 0 0 1-4 3.4H34A4 4 0 0 1 30 78z"
          fill={`url(#${id("bag")})`}
        />
        <path d="M26 40h44l-1 9H27z" fill="#000" opacity="0.08" />
        <path
          d="M38 40v-6a10 10 0 0 1 20 0v6"
          stroke="#A87B44"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <g data-part="chip">
        <rect x="30" y="56" width="36" height="16" rx="8" fill={`url(#${id("chip")})`} />
        <circle cx="39" cy="64" r="2.2" fill="#F7F3E8" />
        <circle cx="46" cy="64" r="2.2" fill="#F7F3E8" />
        <circle cx="53" cy="64" r="2.2" fill="#F7F3E8" />
        <circle cx="60" cy="64" r="2.2" fill="#F7F3E8" />
      </g>

      <g data-part="spark">
        <path
          d="M74 26l1.8 4.6L80 32l-4.2 1.4L74 38l-1.8-4.6L68 32l4.2-1.4z"
          fill="#F59E0B"
        />
      </g>
    </svg>
  );
}

/** The wallet on the portal, with what a finished order puts in it. */
function WalletArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("wallet")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14503B" />
          <stop offset="1" stopColor="#0A3125" />
        </linearGradient>
        <linearGradient id={id("note")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#BFE6D5" />
          <stop offset="1" stopColor="#7FC0A4" />
        </linearGradient>
        <linearGradient id={id("coin")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBCF6B" />
          <stop offset="1" stopColor="#D99B22" />
        </linearGradient>
      </defs>

      <Shadow />

      <g data-part="notes">
        <rect x="30" y="28" width="42" height="20" rx="4" fill={`url(#${id("note")})`} />
        <rect x="34" y="34" width="34" height="2.5" rx="1.25" fill="#0F7A57" opacity="0.5" />
        <rect x="34" y="40" width="22" height="2.5" rx="1.25" fill="#0F7A57" opacity="0.35" />
      </g>

      <g data-part="body">
        <rect x="20" y="42" width="56" height="34" rx="7" fill={`url(#${id("wallet")})`} />
        <rect x="20" y="52" width="56" height="24" rx="7" fill="#000" opacity="0.14" />
        <rect x="54" y="54" width="26" height="12" rx="6" fill="#F7F3E8" />
        <circle cx="63" cy="60" r="3" fill="#0F7A57" />
      </g>

      <g data-part="coin">
        <circle cx="26" cy="26" r="9" fill={`url(#${id("coin")})`} />
        <circle cx="26" cy="26" r="6" fill="#FFF0C4" opacity="0.5" />
        <rect x="24.6" y="21.5" width="2.8" height="9" rx="1.4" fill="#B07A12" />
      </g>
    </svg>
  );
}

/** Takings over time, drawn as a counter's own chalk tally would be. */
function GrowthArt({ className }: ArtProps) {
  const id = useArtId();
  return (
    <svg {...frame(className)}>
      <defs>
        <linearGradient id={id("board")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F3E8" />
          <stop offset="1" stopColor="#E4DCC7" />
        </linearGradient>
        <linearGradient id={id("bar")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0A5A3F" />
          <stop offset="1" stopColor="#31A97C" />
        </linearGradient>
      </defs>

      <Shadow />

      <g data-part="body">
        <rect x="14" y="20" width="68" height="56" rx="6" fill={`url(#${id("board")})`} />
        <rect x="14" y="20" width="68" height="56" rx="6" fill="none" stroke="#CFC4A9" strokeWidth="2" />
      </g>

      <g data-part="bar-1">
        <rect x="26" y="52" width="10" height="16" rx="3" fill={`url(#${id("bar")})`} />
      </g>
      <g data-part="bar-2">
        <rect x="43" y="42" width="10" height="26" rx="3" fill={`url(#${id("bar")})`} />
      </g>
      <g data-part="bar-3">
        <rect x="60" y="32" width="10" height="36" rx="3" fill={`url(#${id("bar")})`} />
      </g>

      <g data-part="arrow">
        <path
          d="M28 44l14-10 12 6 14-14"
          stroke="#F59E0B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M62 26h8v8"
          stroke="#F59E0B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const ART: Record<PartnerArtKey, (props: ArtProps) => React.ReactElement> = {
  storefront: StorefrontArt,
  orders: OrdersArt,
  handover: HandoverArt,
  wallet: WalletArt,
  growth: GrowthArt,
};

export function PartnerArtwork({
  artKey,
  className,
}: {
  artKey: PartnerArtKey;
  className?: string;
}) {
  const Art = ART[artKey];
  return <Art className={className} />;
}
