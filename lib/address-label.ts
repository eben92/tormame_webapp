/** The parts of an address the "deliver to" controls put on screen. */
export interface AddressLabelSource {
  street?: string | null;
  city?: string | null;
}

/**
 * What the "deliver to" control reads, most specific first.
 *
 * A customer who has picked their town during onboarding should see that town,
 * not a generic "choose an address" prompt — the app already knows where they
 * are, and telling them otherwise reads as if their choice was lost. The full
 * address wins when there is one, because it is what the courier will drive to.
 *
 * Shared by every surface (lobby pill, home header, desktop header) so the same
 * customer never sees two different answers to "where am I ordering to".
 */
export function addressLabel(
  address: AddressLabelSource | null | undefined,
  city: string | null | undefined,
  fallback: string,
): string {
  const street = address?.street?.trim();
  const addressCity = address?.city?.trim();

  if (street && addressCity) return `${street}, ${addressCity}`;
  if (street) return street;
  if (addressCity) return addressCity;

  const onboardingCity = city?.trim();
  return onboardingCity || fallback;
}
