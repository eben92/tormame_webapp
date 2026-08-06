import { EntryRouter } from "@/components/shared/entry-router";

/**
 * Entry point. Where a customer belongs depends on state that only exists in
 * the browser (persisted onboarding + session), so the decision runs client-side
 * in `EntryRouter` rather than as a server redirect.
 */
export default function RootPage() {
  return <EntryRouter />;
}
