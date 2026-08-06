/**
 * Reconciles the user's saved category-bubble order with the categories the API currently
 * returns. Persisted order wins for labels that still exist; any label the API added since
 * the order was last saved is appended (in API order); any persisted label the API no
 * longer returns is dropped silently.
 */
export function mergeCategoryOrder(persistedOrder: string[], apiLabels: string[]): string[] {
  const apiSet = new Set(apiLabels);
  const kept = persistedOrder.filter((label) => apiSet.has(label));
  const keptSet = new Set(kept);
  const appended = apiLabels.filter((label) => !keptSet.has(label));
  return [...kept, ...appended];
}
