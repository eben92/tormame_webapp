# Mobile → Web Parity Plan

Port of the Expo/React Native app at `../quups_app` (product name **TORMAME**) to the Next.js 16 app in this repo.

Status: **all 21 routes built and integrated.** Remaining gaps are listed under "Not verified end to end" in Part 5.

---

## Part 1 — Mobile app inventory

### 1.1 Stack (source of truth)

| Concern | Mobile |
|---|---|
| Framework | Expo SDK 54, expo-router 6 (file routes), React 19.1, RN 0.81 |
| Styling | NativeWind 4.2 + Tailwind 3 (`tailwind.config.js`, `global.css`) |
| UI kit | shadcn-style primitives on `@rn-primitives/*` (`components.json`, style `new-york`) |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 + immer + persist (AsyncStorage) |
| Forms | React Hook Form 7 + `@hookform/resolvers` + Zod 4 |
| Sheets | `@gorhom/bottom-sheet` 5 |
| Toasts | `sonner-native` |
| Icons | `lucide-react-native` + `iconsax-react-nativejs` |
| Motion | `react-native-reanimated` 4 |

### 1.2 Design tokens (`global.css` + `lib/theme.ts` — verbatim)

Colors are declared as HSL triples in CSS vars with a hex mirror in `lib/theme.ts`. **Both files are the only place raw values exist; the web port must mirror the same values, not approximations.**

**Light**

| Token | HSL | Hex |
|---|---|---|
| `--background` | `60 23% 97%` | `#FAFAF7` |
| `--foreground` | `156 18% 11%` | `#17211D` |
| `--body` | `158 5% 31%` | `#4A524F` |
| `--card` / `--popover` | `0 0% 100%` | `#FFFFFF` |
| `--card-foreground` / `--popover-foreground` | `156 18% 11%` | `#17211D` |
| `--primary` | `163 94% 24%` | `#047857` |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--primary-pressed` | `163 88% 20%` | `#065F46` |
| `--primary-soft` | `152 81% 96%` | `#ECFDF5` |
| `--secondary` / `--muted` | `60 15% 94%` | `#F1F1EC` |
| `--secondary-foreground` | `156 18% 11%` | `#17211D` |
| `--muted-foreground` | `171 3% 43%` | `#6B7271` |
| `--accent` | `38 92% 50%` | `#F59E0B` |
| `--accent-foreground` | `23 87% 14%` | `#451A03` |
| `--destructive` | `0 74% 42%` | `#B91C1C` |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--success` | `163 94% 24%` | `#047857` |
| `--warning` | `26 90% 37%` | `#B45309` |
| `--info` | `200 98% 32%` | `#0369A1` |
| `--border` / `--input` | `60 10% 90%` | `#E8E8E3` |
| `--ring` | `163 94% 24%` | `#047857` |

**Dark** (`.dark:root`)

| Token | HSL | Hex |
|---|---|---|
| `--background` | `150 16% 7%` | `#101613` |
| `--foreground` | `60 10% 96%` | `#F5F5F1` |
| `--body` | `150 6% 75%` | `#BCC4BF` |
| `--card` / `--popover` | `150 8% 11%` | `#181E1B` |
| `--primary` | `158 64% 52%` | `#34D399` |
| `--primary-foreground` | `156 30% 8%` | `#0B1712` |
| `--primary-pressed` | `160 84% 39%` | `#10B981` |
| `--primary-soft` | `163 50% 14%` | `#123528` |
| `--secondary` / `--muted` | `150 6% 15%` | `#222824` |
| `--muted-foreground` | `150 5% 65%` | `#A0A8A3` |
| `--accent` | `43 96% 56%` | `#FBBF24` |
| `--destructive` | `0 74% 55%` | `#E5484D` |
| `--warning` | `43 96% 56%` | `#FBBF24` |
| `--info` | `199 89% 60%` | `#38BDF8` |
| `--border` / `--input` | `150 8% 18%` | `#262D29` |
| `--ring` | `158 64% 52%` | `#34D399` |

**Radii:** `--radius: 1.5rem` (card 24), `--radius-image: 1rem` (16), `--radius-sheet: 2rem` (32), pill `999`. Tailwind exposes `rounded-card`, `rounded-image`, `rounded-sheet`, plus `lg = var(--radius)`, `md = calc(var(--radius) - 2px)`, `sm = calc(var(--radius) - 4px)`.

**Typography** — Bricolage Grotesque (display/heading) + DM Sans (body). Families: `font-display` (800), `font-heading` (700), `font-heading-semi` (600), `font-sans` (DM Sans 400), `font-body-medium` (500), `font-body-bold` (700).

Text scale (`components/ui/text.tsx`):

| Variant | Spec |
|---|---|
| `display` | Bricolage 800, 32px / 38px, `text-foreground` |
| `h1` | Bricolage 700, 26px / 32px |
| `h2` | Bricolage 700, 22px / 28px |
| `h3` | Bricolage 600, 18px / 24px |
| `body` | DM Sans 400, 16px / 24px, `text-body` |
| `body-strong` | DM Sans 700, 16px / 24px, `text-foreground` |
| `body-small` | DM Sans 400, 14px / 20px, `text-body` |
| `caption` | DM Sans 500, 12px, uppercase, tracking `0.06em`, `text-muted-foreground` |
| `button` | DM Sans 700, 16px / 20px |

**Motion:** `MOTION = { press: 120, base: 200, sheet: 280 }` ms. Press feedback everywhere = scale to 0.97 + opacity 0.9 over 120ms (`PressableScale`), disabled when reduced-motion is on.

**Elevation** (shadow color `#17211D`):
- `e1` — y1, blur 3, opacity .07
- `e2` — y4, blur 14, opacity .10
- `e3` — y12, blur 32, opacity .16

**Overlays:** sheet scrim `rgba(16,22,19,0.5)`; photo header scrim gradient `rgba(16,22,19,0.5)` → `rgba(16,22,19,0.82)`. Splash brand background `#002923`.

**Spacing/sizing conventions observed:** screen gutter 16px (`px-4`); section gap 24px (`gap-6`); card padding 16px; min touch target 48px (`min-h-12`) applied to every interactive row; tab bar 64px + safe area; rails gap 12px, gutter 16px; trending card width = 78% of viewport.

### 1.3 Component inventory

**`components/ui` (primitives)**

| Component | Notes to reproduce |
|---|---|
| `text` | 9 variants above; context-based class inheritance (`TextClassContext`) |
| `button` | pill (`rounded-full`); variants default / destructive / outline / secondary / ghost / link; sizes default h-48, sm h-44, lg h-56, icon 48×48; loading spinner inline; `dimmed` prop |
| `input` | h-48, `rounded-full`, 1.5px border, focus border → primary; multiline variant → `rounded-card`, min-h-96, px-16/py-12; `InputWithIcon` (left/right), `PasswordInput` (eye toggle) |
| `card` | `rounded-card`, 1px border, `bg-card`, py-16; Header/Title/Description/Content/Footer |
| `badge` | pill, px-8/py-2, variants default (primary-soft) / secondary / destructive / outline / success / warning / failed / accent |
| `skeleton` | `bg-muted animate-pulse rounded-image` |
| `filter-chip` | `default`: active = primary-soft + primary/20 border, idle = muted, text 12px; `tab`: active = solid primary + bold 14px white, idle = card + border; min 48px height |
| `numbers` (`QuantityStepper`) | pill on muted, two 48×48 round `bg-card` buttons, disabled at bounds at 40% opacity |
| `pressable-scale` | universal tap wrapper (scale 0.97, 120ms, optional haptic) |
| `bottom-sheet` | gorhom wrapper + `expandBottomSheetReliably` |
| `otp-input`, `phone-input`, `amount-input` | phone = +233 prefix + Ghana validation |
| `checkbox`, `switch`, `select`, `dropdown-menu`, `separator`, `label`, `icon`, `shell` | rn-primitives shadcn ports |
| `states/empty-state` | 80px primary-soft circle + icon 36 + h3 + `lg` button, min-w-224 |
| `states/error-state` | 80px destructive/10 circle, offline vs server icon, title + message + retry |
| `states/skeleton-blocks` | `SkeletonCard`, `SkeletonRow`, `SkeletonHero` |

**`components/shared` (composites)**
`cards/store-card` (portrait 196×150 + landscape row 72px thumb), `cards/trending-card` (+skeleton, 16:9), `cards/product-card` (fixed-height menu row, 72px image, qty pill), `cards/order-card`, `cards/search-product-card`, `cards/search-store-header`, `cards/search-view-all-card`, `section-header`, `category-chip-rail` (auto-centers active chip), `home-promo-section`, `global-cart-bar` (floating pill above tab bar), `order-status-badge`, `order-status-timeline`, `star-picker`, `rating-sheet`, `address-bottom-sheet`, `address-form-sheet`, `branch-bottom-sheet`, `city-sheet`, `city-row-list`, `variant-selector-sheet` (616 lines — variants + modifier groups + qty + add-to-basket), `countdown-unit`, `splash-cover`, `tab-icon-with-dot`, `header/stack-header`.

**`components/shop`**: `shop-banner`, `shop-category-bar` (sticky tabs synced to scroll offsets), `shop-section-header`.
**`components/lobby`**: `category-bubbles`. **`components/onboarding`**: `city-wheel` (native wheel picker).

### 1.4 Screen inventory + flows

Entry: `app/index.tsx` — 2s brand splash, waits for store hydration (3s cap), then routes: onboarded → `/home` (signed in) or `/lobby`; not onboarded + signed in → adopt city from default address → `/home`, else `/onboarding?mode=city-only`; otherwise `/onboarding`.

| # | Route (mobile) | Purpose | States |
|---|---|---|---|
| 1 | `/onboarding` | 3 steps: city wheel → name → phone; `mode=city-only` collapses to step 1; success overlay 900ms | cities loading / load-error / success |
| 2 | `/lobby` | Guest hero: gradient, address pill, category bubbles, sign-in / start-browsing. Auto-redirects to `/home` if only 1 category | loading, redirect |
| 3 | `/auth/signin` | Phone/email segmented toggle, password, forgot link, terms | idle / error banner / pending |
| 4 | `/auth/register` | name, email, phone, password, terms checkbox | same |
| 5 | `/auth/forgot-password` → `/otp` → `/reset` | request code → verify → new password (resend w/ countdown) | pending, invalid OTP, toasts |
| 6 | `/home` (tab) | Address pill, search entry, persistent category rail, promo, "Popular near you" rail, "Trending now" snap rail; category param switches to vertical store list | loading skeletons, per-rail error row, empty, refetch |
| 7 | `/explore` (tab) | Debounced (300ms) global search → store groups with product rails + "view all"; idle = category chips + trending tags | skeleton, error, empty, infinite scroll |
| 8 | `/orders` (tab) | Active / Past / Cancelled chips, order rows with pay/verify CTA, 15s polling while active orders exist | guest view, skeleton, error, empty, infinite scroll |
| 9 | `/profile` (tab) | Guest gradient hero or auth header; menu sections (Discover / My account / App / Support), city sheet, sign out | logging out |
| 10 | `/shops/[slug]` | Hero banner w/ scrim, collapsing header, sticky category bar synced to menu offsets, product rows, in-shop search, variant sheet, cross-store basket confirm | loading, not-found, empty, search-empty |
| 11 | `/collection/[sort]` | See-all list for popular/trending | loading, error, empty, load-more error |
| 12 | `/checkout` | Delivery/Pickup toggle, address or branch selector, grouped basket lines w/ steppers, drop-off instruction chips + note, service fee (2%, min GH₵1), totals, place order | empty basket, branch load failure, missing address/consent toasts, pending |
| 13 | `/order-payment` | Paystack authorization URL in a WebView + callback capture | pending / success / failure |
| 14 | `/order-confirmation` | Success screen w/ confirmation code | — |
| 15 | `/order-details/[id]` | Status banner + timeline, items, address/branch, code, totals, pay/verify CTA, rating sheet; polls 15s (4s while payment pending) | loading, error, ratable |
| 16 | `/addresses` | Saved address list, default badge, edit/remove, add sheet | loading, error, empty |
| 17 | `/personal-info` | Profile form + change-password form | field errors, toasts |
| 18 | `/settings` | Theme preference (system/light/dark), push switch, legal links, version | — |
| 19 | `/help` | Contact card + 5-item FAQ accordion | — |
| 20 | `/web` | In-app browser for terms/privacy | — |
| 21 | `/callback/[slug]` | Payment/deep-link callback router | — |

All static copy lives in `lib/strings.ts` — it ports across verbatim.

### 1.5 API layer

- **Base URL:** `ENV.BACKEND_URL`, effective value `https://staging.api.quups.app/v1` (verified 200). See ambiguity A1.
- **Envelope:** `{ data, status, message, timestamp }`. Paginated: `{ meta: { page, limit, total_records, total_pages }, data: [] }` — **except `/orders`**, which returns `{ meta: { total, limit, offset }, data }`.
- **Auth:** `Authorization: Bearer <access_token>`; on 401 (outside the login/register/otp/logout endpoints) a single-flight refresh hits `POST /auth/refresh-token` with `{ refresh_token }`, retries once, else clears session.
- **Errors:** thrown `Error` with `message` from `errBody.message || errBody.error` and a `status` field; `classifyApiError` maps `TypeError` → offline, ≥500 → server, else client.
- **Query defaults:** retry 3, but any error whose message is `unauthorized` logs out immediately (queries and mutations).

Endpoints in use:

| Method | Path | Used by |
|---|---|---|
| POST | `/auth/signin`, `/auth/register`, `/auth/refresh-token`, `/logout` | auth |
| POST | `/auth/forgot-password/request?msisdn=`, `/auth/forgot-password/validate-otp`, `/auth/forgot-password`, `/auth/forgot-password/resend-otp?msisdn=` | password reset |
| GET | `/cities` (staleTime 24h, infinite retry w/ backoff) | onboarding, city sheet |
| GET | `/categories/grouped` | home, explore, lobby |
| GET | `/companies?sort=&category_vertical=&city=&limit=&offset=` (staleTime 60s) | home rails, collection |
| GET | `/companies/{id}`, `/shops/{id}?city=`, `/shops/{id}/branches` (staleTime 1h) | shop, checkout |
| GET | `/companies/{id}/menu`, `/company-categories?company_id=`, `/products?company_id=…`, `/products/{id}` | shop, variant sheet |
| GET | `/search?search=&city=&limit=&offset=` | explore |
| GET/POST/PUT/DELETE | `/me/addresses`, `/me/addresses/{id}` | addresses, checkout |
| PUT | `/me`, POST `/me/change-password` | personal info |
| POST | `/orders`; GET `/orders?statuses=&limit=&offset=`; GET `/orders/{id}` | orders |
| GET | `/orders/{id}/payment/authorization`; POST `/orders/{id}/payment/callback?reference=` | payment |
| GET/PUT | `/orders/{id}/rating` (404 = not rated) | rating |
| — | `/push/*` | native only, **out of scope for web** |

### 1.6 Client stores (to port)

`user` (tokens + profile, persisted, hydration flag), `onboarding` (city, name, phone, hasOnboarded, v1 migration), `cart` (storeId + composite `packageKey` line items, single-store rule), `address` (selected saved / local address), `checkout` (fulfillment, drop-off, branch, consent — not persisted), `settings` (theme preference, push flags), `product-sheet` (open flag), `category-order`.

---

## Part 2 — Web app: current state

Bare `create-next-app`: Next **16.3.0**, React 19.2, Tailwind **v4** (CSS-first `@theme`, no `tailwind.config`), `app/{layout,page,globals.css}`, Geist fonts, ESLint flat config, pnpm. No providers, no components, no API layer, no shadcn, no `src` dir, no path alias beyond default. `.env` has `NEXT_PUBLIC_BACKEND_URL=https://staging.api.quups.com` (unreachable — see A1).

Per `AGENTS.md`, I will read `node_modules/next/dist/docs/01-app/**` for the routing/data/metadata/proxy chapters before writing code, since this Next version deviates from training data.

---

## Part 3 — Build plan

### 3.1 Foundation (before any page)

1. **Tokens.** `app/globals.css`: port every CSS var above verbatim into `:root` / `.dark`, expose them through Tailwind v4 `@theme inline` (`--color-primary: hsl(var(--primary))`, `--radius-card`, `--radius-image`, `--radius-sheet`, `--shadow-e1/e2/e3`, motion durations `--duration-press/base/sheet`). Fonts via `next/font/google` (Bricolage Grotesque 600/700/800, DM Sans 400/500/700) bound to `--font-display` / `--font-sans`. Dark mode via `next-themes` (`class` strategy) so `settings.themePreference` maps 1:1.
2. **Typography primitive.** `components/ui/text.tsx` — same 9 variants, rendering real semantic elements (`h1`/`h2`/`h3`/`p`/`span`).
3. **shadcn init** (`components.json`, new-york, CSS vars) then add: button, input, form, label, checkbox, switch, select, dropdown-menu, separator, badge, card, skeleton, sheet, drawer (vaul), dialog, tabs, accordion, sonner, avatar, scroll-area, tooltip. **Every one is then rewritten** to the mobile spec (pill radii, 48px heights, 1.5px borders, DM Sans weights, primary-pressed active states, 120ms press scale).
4. **Interaction parity:** `PressableScale` web equivalent (`active:scale-[0.97] transition-transform duration-[120ms]`, `motion-reduce:` guard) applied through the button/pressable primitives.
5. **API client** `lib/api/client.ts`: `apiFetch<T>(endpoint, { schema, ...init })` — envelope unwrap, bearer header, single-flight refresh + one retry, `ApiError { status, message }`, `classifyApiError`/`getErrorCopy` ported. Every response validated with Zod; types inferred (`z.infer`), zero hand-written duplicates. Schemas live in `lib/api/schemas/*` mirroring `services/*/type.ts`.
6. **Query layer** `lib/query-client.ts` + `providers.tsx`: same retry/logout rule, per-hook `staleTime`/`refetchInterval` copied exactly (cities 24h, companies 60s, branches 1h, orders 15s/4s polling, `refetchIntervalInBackground: false`).
7. **Stores:** port the six Zustand stores with `persist` on `localStorage` + `skipHydration`/mounted guard to avoid SSR mismatch.
8. **Copy:** port `lib/strings.ts` verbatim.
9. **App shell:** `app/layout.tsx` (metadata, fonts, theme, providers), route groups `(lobby)` / `(protected)`, `loading.tsx` + `error.tsx` per segment, `not-found.tsx`, global error boundary.

### 3.2 Responsive strategy (defined once)

Mobile-first. **One breakpoint that matters: `md` = 768px.**

- **< 768px — pixel parity.** Everything renders at the mobile app's exact sizes: 16px gutters, 48px touch targets, the same type scale (no `md:text-sm` shrink shadcn ships with), fixed bottom tab bar (64px + `env(safe-area-inset-bottom)`), stack headers with back buttons, bottom sheets via **vaul** `Drawer` (rounded-sheet top, same scrim `rgba(16,22,19,0.5)`, 280ms), floating cart bar above the tab bar, horizontal snap rails via CSS scroll-snap.
- **≥ 768px — desktop marketplace, in the Glovo / Deliveroo / Bolt Food idiom.** The bottom tab bar is replaced by a **sticky top header**: logo, address selector (opens the same address picker as a dialog), a live search field, then Orders + account menu on the right. Below it a horizontal category rail. Listing pages (`/home`, `/collection`, `/explore` results) become **left filter/category rail + wide store grid** (2 cols at md, 3 at lg, 4 at xl) inside a `max-w-[1280px]` container with 32px gutters. Shop page = sticky menu-category sidebar + product grid + sticky basket panel on the right (Deliveroo pattern). Checkout = two columns, form left, sticky order summary right. Order details = content left, sticky status timeline right. Orders list = denser rows with inline status + total columns. Bottom sheets become `Dialog`s (address / branch / variant); the floating cart bar becomes the sticky basket panel. Hover states on every card (image scale + shadow lift using `--shadow-e2`).
- `lg` (1024) / `xl` (1280) only widen the grid; no third layout system.
- Design language, tokens, and copy are identical across both — only layout and density change.

### 3.3 Route map

| Mobile | Web |
|---|---|
| `/` splash+router | `/` — server redirect shell + client bootstrap (no 2s artificial splash on web) |
| `/onboarding` | `/onboarding` |
| `/lobby` | `/lobby` |
| `/auth/*` | `/(lobby)/auth/*` |
| `/home` | `/home` (tab → sidebar item) |
| `/explore` | `/explore` |
| `/orders` | `/orders` |
| `/profile` | `/profile` |
| `/shops/[slug]` | `/shops/[slug]` (async `params`) |
| `/collection/[sort]` | `/collection/[sort]` |
| `/checkout` | `/checkout` |
| `/order-payment` (WebView) | full-page redirect to Paystack `authorization_url`; return via `/callback/[slug]` |
| `/order-confirmation`, `/order-details/[id]`, `/addresses`, `/personal-info`, `/settings`, `/help` | same paths |
| `/web?uri=` (WebView) | plain external links |

### 3.4 Page order (each page complete before the next)

Per page: build UI → wire TanStack Query + Zod → RHF forms → Chrome DevTools MCP end-to-end test (interactions, network, console) → visual check at 390px and 1440px against the mobile screen → full flow test → mark done here.

1. Foundation (3.1) — not a page, but gated the same way
2. `/lobby`
3. `/auth/signin`
4. `/auth/register`
5. `/auth/forgot-password` (+ otp, reset)
6. `/onboarding`
7. `/home`
8. `/explore`
9. `/shops/[slug]` (+ variant sheet)
10. `/collection/[sort]`
11. `/checkout` (+ address & branch sheets)
12. payment redirect + `/callback` + `/order-confirmation`
13. `/orders`
14. `/order-details/[id]` (+ rating)
15. `/profile`
16. `/addresses`
17. `/personal-info`
18. `/settings`
19. `/help`
20. Full-app pass: every route, both viewports, console/hydration/network/layout-shift sweep, then `pnpm build` + lint + typecheck clean

### 3.5 Explicitly out of scope (native-only)

Push notifications and the unread tab dot, haptics, expo splash/confetti/Skia, in-app WebView, `react-native-view-shot`. The push service layer is not ported; the Orders tab renders without the unread dot.

---

## Part 4 — Ambiguities / decisions needed

**A1 — API base URL. DECIDED:** `NEXT_PUBLIC_BACKEND_URL=https://staging.api.quups.app/v1` (verified `GET /v1/cities` → 200). The `.com` value in `.env` gets replaced.

**A2 — Token storage. DECIDED:** `localStorage` via Zustand `persist`, mirroring the mobile AsyncStorage flow — same single-flight refresh, no Next proxy layer.

**A3 — Desktop shell. DECIDED:** Glovo / Deliveroo / Bolt Food idiom — sticky top header (logo, address selector, search, orders, account), category rail, filter rail + wide store grid, sticky basket panel on shop pages. Detailed in §3.2.

**A4 — `gpt-taste` scope. DECIDED:** applied to `/lobby` only (the guest landing surface) — its GSAP motion, editorial spacing and layout variance run there, but still on **brand tokens and brand fonts**: Bricolage Grotesque + DM Sans stay, the emerald/cream palette stays. Its font list (Satoshi/Cabinet Grotesk) and "invent your own values" latitude are overridden by the verbatim-token rule. Every signed-in product screen stays parity-exact and skips the skill.

**A5 — Payment.** Mobile opens Paystack in a WebView and intercepts the callback. On web I'll do a full-page redirect to `authorization_url` and handle the return at `/callback/[slug]`, then `POST /orders/{id}/payment/callback?reference=`. Confirm that the Paystack callback URL registered for staging can return to the web origin.

**A6 — City wheel.** Onboarding step 1 uses a native wheel picker. Web equivalent: a scroll-snap column list with the same visual centering (not a `<select>`), so it still reads as the mobile step. Flagging since it can't be identical.

**A7 — Brand name.** Copy says "TORMAME", the repo is "quups". Porting `strings.ts` verbatim keeps TORMAME everywhere. Confirm that's intended for web.

**A8 — Auth-guard behaviour.** Mobile `(protected)` renders guest views inline (home/orders/profile all work signed-out) rather than redirecting. Web will do the same — no middleware redirect — so guests can browse and are prompted at checkout.

---

## Part 5 — Progress log

| Page | UI | API | Forms | DevTools test | Design review | Done |
|---|---|---|---|---|---|---|
| Foundation (tokens, primitives, API client, stores, shell) | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/lobby` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/signin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/register` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/forgot-password` (+ reset) | ✅ | ✅ | ✅ | partial | ✅ | |
| `/onboarding` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/home` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/explore` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/shops/[slug]` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/collection/[sort]` | ✅ | ✅ | — | partial | ✅ | |
| `/checkout` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| payment redirect + `/callback` + `/order-confirmation` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/orders` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/order-details/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| `/addresses` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/personal-info` | ✅ | ✅ | ✅ | partial | ✅ | |
| `/settings` | ✅ | — | — | ✅ | ✅ | ✅ |
| `/help` | ✅ | — | — | ✅ | ✅ | ✅ |

### Foundation — what landed

- `app/globals.css` — every mobile token verbatim (light + dark), radii, `--shadow-e1/e2/e3`, motion durations, scrims, `pb-safe`/`pt-safe`/`scrollbar-none` utilities.
- Fonts: Bricolage Grotesque + DM Sans via `next/font/google`, bound to `--font-display` / `--font-sans`.
- shadcn (radix base, nova style) initialised; button, input, badge, card, skeleton, drawer, dialog rewritten to the mobile spec (48dp pill button, 1.5px pill input, 32px sheet radius, ink scrim, 120ms press-scale). `Text`, `FilterChip`, `QuantityStepper`, `EmptyState`/`ErrorState`/skeleton blocks, `ResponsiveSheet` (drawer under 768px, dialog above) added.
- `lib/api/client.ts` — envelope unwrap, bearer, single-flight refresh + one replay, `ApiError`/`ApiSchemaError`; every response validated by Zod (`lib/api/schemas/*`), types inferred.
- Stores ported: user, onboarding, cart, address, checkout, category-order — `localStorage` persist with explicit hydration in `Providers`.
- Copy (`lib/strings.ts`) and pure helpers (order-status, city, branch, collection, store-image, search-rail, category-icons, payment-cta) ported.
- `.env` now points at `https://staging.api.quups.app/v1`; `.env.example` documents every variable.

### Register and order/payment — executed live

**Register.** Ran on staging: empty-terms validation fired with the mobile's message, then a real account was created (`Web Parity Test`, +233241234567, id `56d5fad5-3c9f-4ca5-b1ba-f8e62ce6823a`), tokens stored, redirect to `/home`. **This account now exists on staging — delete it when you're done with it.**

**Order + payment.** Two orders placed on that account against IKE'S Tasteland Pizza:
- `9f865465-3e4f-4887-8ef5-8f3ed4b26deb` — GH₵90, **paid** through Paystack test mobile money, confirmation code 575393.
- `ea438a39-2b10-45fd-8073-d8d96bec3e38` — GH₵30, left unpaid on purpose; it renders as "Waiting for payment" with the Pay now CTA.

The order body carried `new_address` (the device-local address), the consent gate blocked the CTA until ticked, the basket cleared on success, and both orders appear in the Orders list with the right status tones.

### Two integration findings

**1. The Paystack callback returns to the backend's page, not to us.** After paying, Paystack redirects to `https://dash.quups.app/payment-redirect`, whose "VIEW ORDER" button posts a message to `window.ReactNativeWebView` — which exists only inside the native WebView. In a browser it does nothing, so a paying web customer was stranded there.

Fixed inside the web app rather than waiting on a backend change: `/order-payment` now opens Paystack in a second tab and stays put as the anchor screen, polling `GET /orders/{id}` (4s while payment is PENDING, which the shared query config already does) and forwarding to `/callback/success?orderId&reference&code` the moment the backend reports PAID. Verified live — the waiting screen redirected on its own and showed "Order placed!" with the real confirmation code. It also handles a blocked popup with an explicit "Open payment" button.

Still worth doing server-side: give the Paystack callback a web-aware return URL so the customer lands back on this app directly. The polling anchor works regardless, so it is not a blocker.

**2. The checkout total is not what the customer is charged.** Checkout shows subtotal + a 2% (min GH₵1) service fee — GH₵91.80 for a GH₵90 basket — but the order the backend creates, and the amount Paystack collects, is GH₵90.00. This is ported behaviour: the mobile app computes the same client-side fee and the API's `total_amount` excludes it. Flagging rather than silently changing it, since the fix is a product decision (drop the fee from the display, or have the API charge it).

### Change password — executed live, and it exposed a session bug

Run on the test account: wrong current password → the field-level "Current password is incorrect" message; correct one → "Password changed", form cleared, session intact. Verified by signing in with the new password, then changed it back so the credentials below still hold.

**The bug it exposed:** staging answers `POST /me/change-password` with **401** for a wrong current password. The client treated every 401 as an expired session, so it refreshed the token, replayed the request, got 401 again, and silently signed the customer out for a typo. `lib/api/client.ts` now marks 401s from that endpoint as domain errors (`ApiError.isDomainError`): no refresh, no replay, no logout — just the field error. The same failure exists in the mobile app, which logs out on any error whose message is `unauthorized`.

### Two more fixes from this pass

- **`/` ignored the mobile's entry rule.** It hard-redirected to `/lobby`; it now mirrors `app/index.tsx` — onboarded → `/home` when signed in else `/lobby`, not onboarded → `/onboarding` (`?mode=city-only` when a session exists). Verified: a signed-in, un-onboarded browser landed on the city-only step, finished it, and arrived at `/home`.
- **Personal info never prefilled the name.** `defaultValues` latched onto the pre-hydration empty session; it now uses RHF's reactive `values`.

### Still not executed

1. **Password reset** — needs a live SMS code, which I can't receive.
2. **Paystack's Cloudflare bot check** — it appeared when a checkout URL was opened twice in quick succession. That is Paystack's own protection on their domain; I did not attempt to solve it. The payment path itself is proven (one real paid order).

### Test account

`Web Parity Tester` · +233241234567 · `web.parity.test.0806@example.com` · password `webtest12345`. Created by this testing — **delete it when you no longer need it.**

Everything else was exercised live: sign-in, the store list and its city scoping, search, product detail with modifier groups, add-to-basket, basket persistence, checkout, order placement, payment, the orders list, order detail with its timeline, saved addresses, and the category/branch/address sheets.

### Auth — verified

Sign-in: phone/email segmented toggle, +233-locked phone field, password reveal, sticky footer on mobile / centred card on desktop. Empty-submit validation shows the mobile's exact messages; a real 401 from staging renders the server's message in the banner; a real sign-in stores tokens, maps the profile, and runs the post-login city adoption (verified in localStorage).

Register and forgot-password/reset are built with the same schemas and copy as mobile (name ≥ 2, email, Ghana phone, password ≥ 6, terms required; reset: 6-digit OTP, password ≥ 6, confirmation match) and reviewed visually in light and dark. Their success paths are **not** end-to-end tested: registering would create a real staging account, and the reset flow needs a live SMS code.

Substitution to note: the tab-bar and menu icons use lucide equivalents of the mobile app's iconsax set (Element3 → LayoutGrid, Discover → Compass, Bag → ShoppingBag, Profile → User). Shapes differ slightly; weights and sizes match.

### `/lobby` — verified

Mobile 390×844: gradient shell, address pill, scrim hero card, 4-per-row bubbles, image band, footer CTAs — matches the native screen. Desktop 1440×900: floating nav pill, cinematic hero with photo wash, two-line headline, category board (gpt-taste applied here only, on brand tokens/fonts).

### `/home` — verified

Mobile: address pill, search entry, persistent category rail, promo hero, "Popular near you" rail and the snap-scrolling "Trending now" rail with the next card peeking (a `scroll-px-4` fix was needed — scroll snapping was eating the 16px gutter). Bottom tab bar at 64px + safe area. Desktop: sticky marketplace header (logo, address, search, Explore/Orders/Profile), category rail, promo band, and 4-column grids inside a 1280px container.

Live API: two sorted `GET /companies` queries (popular + trending, 60s staleTime, city-scoped) plus `GET /categories/grouped`; category chips switch to the vertical-scoped list with its own loading/empty/error states and per-rail retry rows.

### `/lobby` — API

Live API: `GET /categories/grouped` drives the bubbles; `GET /cities` drives the city picker; guest address saves to the device and the pill reflects it after reload. Address form runs RHF + Zod with the mobile's messages. Console clean (an `aria-hidden`/focus warning was fixed by making the pill the sheet's own trigger and enabling `autoFocus`). `pnpm build`, `pnpm lint`, `tsc --noEmit` all clean.

---

## Rendering architecture (Next.js 16 Cache Components)

The port originally rendered everything in the browser: HTML shipped empty, React booted, React Query fetched, content appeared. That is now inverted for every page whose data is public.

`next.config.ts` enables two flags:

- **`cacheComponents: true`** — Partial Prerendering becomes the default. Each route ships a static shell (chrome + skeleton) that a CDN can serve, and the rest streams into the same response.
- **`partialPrefetching: true`** — a `<Link>` prefetches its destination's shared App Shell, so a rail of twenty store cards costs one prefetch instead of twenty.

### What the server fetches

`lib/api/server/` holds a second, deliberately small API layer:

- `fetch.ts` — `serverFetch`, the same envelope unwrapping and Zod validation as the browser client, minus the bearer token. It is `server-only`, so it can never be pulled into the client bundle. `tolerant()` wraps every read: if staging is down, the page renders its skeleton and the client query takes over, exactly as before.
- `catalog.ts` — `use cache` readers with an explicit `cacheLife` and `cacheTag` each: cities (`days`), category groups (`hours`), company lists / shop / menu (`minutes`). `minutes` is the shortest profile whose 5-minute `stale` still lets the result ride along in a prefetch.
- `request-time.ts` — `requestTime()`, a named `connection()`. See "Why request time" below.

Server data is handed to the existing screens as `initialData` for their React Query hooks, so the hooks stay the single source of truth: the list paints from the server's copy, then revalidates in the background. Nothing was rewritten into a Server Component.

### Why request time, not build time

React Query reads `Date.now()` while rendering. A build-time prerender rejects unstable values, so a screen that uses it can never be baked into static HTML — it gets silently left behind its Suspense fallback, and the shipped page is a skeleton until JavaScript runs. That is the opposite of the goal.

`requestTime()` moves those subtrees to request time. The shell is still static and instant; the real markup now streams into the same response, which is what a crawler and a slow phone actually read. Verified: `/lobby`, `/home`, `/explore`, `/collection/[sort]`, `/onboarding` and `/shops/[slug]` all ship rendered content, each with exactly one `<h1>`.

### No city cookie

`/companies` returns the same stores regardless of `city`; the parameter only resolves a store's delivery fee. So the server renders the list without a city and the client's query — which does know the city, from `localStorage` — fills the fees in on its first revalidation. No mirroring of client state into cookies.

### What stays client-only, and why

`/orders`, `/order-details/[id]`, `/checkout`, `/profile`, `/addresses`, `/personal-info` and `/settings` need the customer's bearer token, which lives in `localStorage` (decision A2, mirroring the mobile app). The server cannot read it, so it cannot fetch these — `/me/*` and `/orders/*` answer 401 without it. Those routes still get a prerendered shell so navigation feels instant, and the client keeps its existing polling. **Moving the session to an httpOnly cookie is the only thing that would unlock server-rendering them** — a real change with real security upside, but it reverses A2, so it is your call rather than mine.

The desktop header's address sheet is the one overlay that survives a navigation with its state, because it lives in the layout rather than a route. Route-owned sheets close themselves (a `useLayoutEffect` cleanup in `ResponsiveSheet`, needed because Cache Components keeps a route mounted-but-hidden via `<Activity>` instead of unmounting it).

### SEO

- `metadataBase`, Open Graph and Twitter defaults in the root layout; a canonical URL on every public route.
- `/shops/[slug]` builds its title, description and OG image from the store itself, and emits `Restaurant`/`Store` JSON-LD — rating included only when the API actually returned one.
- `app/sitemap.ts` lists the public routes plus every store; `app/robots.ts` disallows the session-scoped ones.
- Store cards are real `<a>` elements now, not buttons: crawlable, prefetched, middle-clickable. Same for "See all".
- Exactly one `<h1>` per page. `/home` has no visible page title in the mobile design, so its heading is screen-reader-only rather than invented.

---

## Site identity on mobile

Mobile parity means the *screens* match the native app, not that the website hides whose it is. Every route now carries the logo and wordmark:

- `BrandBar` sits above the content on mobile inside `AppShell`, and above the card on the auth screens (`BrandMark`, centred, on desktop — where the card is the whole page and the app header isn't rendered).
- It is not sticky. Several screens already pin their own bars to the top of the viewport (the shop's category rail), and a second sticky layer would either cover them or force every one of them to know this bar's height.
- The bar owns the top safe-area inset, so the screens beneath it dropped their own `pt-safe` — otherwise an iPhone would pay the inset twice.
- Desktop is unchanged: the sticky marketplace header already carries the brand, and `BrandBar` is `md:hidden`.

## Payment confirmation (`/payment-redirect`)

Ported from `quups_web`'s `/payment-redirect` route, rebuilt on this design system. Same contract, same states, same polling cadence (five checks, three seconds apart): missing reference, verifying, confirming, lookup failure, payment failed, confirmation taking too long (with Refresh), and the paid receipt with its line items, subtotal, delivery fee and total.

Two things differ from the original:

- **It works for web customers.** The original only knows how to hand off through `window.ReactNativeWebView`. This one still does that when it is loaded inside the app's WebView, and otherwise navigates within the website — "View order" goes to `/order-details/{id}`, "Back to home" to `/home`.
- **Polling is derived, not counted.** The window is a timestamp comparison, and `refetchInterval` stops itself on a final status or once the window has elapsed, so there is no counter state updated from an effect.

`payment_status` is read as a plain string rather than a Zod enum: this is the last screen a customer sees after paying, and it must not fail closed because the backend added a status we haven't seen. Anything unrecognised falls through to "still confirming".

The page in `quups_web` stays where it is — this one is additive, and the backend can point its Paystack callback here when you're ready.

### Bot protection

The lookup is public and takes a reference, so it is worth protecting. `/payment-redirect` runs an invisible reCAPTCHA v3 check (`hooks/use-recaptcha.ts`) and has the server verify the token at `app/api/recaptcha` — the secret never reaches the browser, which is the only reason that route exists. Score threshold is Google's default 0.5, and the action is checked against the token.

Two deliberate escape hatches: with no keys configured the check is skipped (local development shouldn't need Google credentials), and if Google itself is unreachable the client passes rather than stranding someone who has just paid — the server-side check is what actually gates abuse. Keys go in `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`; both are documented in `.env.example`.
