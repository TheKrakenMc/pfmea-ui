/** Collect the API's bounded pages before applying the catalog's client-side filters. */
export async function loadCatalog<T>(fetchPage: (skip: number, limit: number) => Promise<T[]>,
  isCancelled: () => boolean = () => false): Promise<T[]> {
  const items: T[] = [];
  const limit = 200;
  while (!isCancelled()) {
    const page = await fetchPage(items.length, limit);
    items.push(...page);
    if (page.length < limit) break;
  }
  return items;
}
