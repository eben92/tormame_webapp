/**
 * The app-wide tap feedback: scale to 0.97 over 120ms, honouring reduced motion.
 * Mirrors `PressableScale` on mobile — every tappable surface uses this so the
 * two apps feel identical under the finger.
 */
export const pressableScale =
  "transition-[transform,background-color,opacity] duration-(--duration-press) active:scale-[0.97] motion-reduce:active:scale-100";

/** Focus ring shared by non-button tappables (cards, rows, chips). */
export const focusRing =
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";
