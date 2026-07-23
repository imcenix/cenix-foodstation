interface SortableContent {
  id: string;
  data: {
    order?: number | null;
    featured?: boolean;
  };
}

export function sortRestaurants<T extends SortableContent>(items: T[]): T[] {
  return items.sort((a, b) => {
    const orderA = a.data.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.data.order ?? Number.POSITIVE_INFINITY;

    if (orderA !== orderB) return orderA - orderB;
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;


    return a.id.localeCompare(b.id);
  });
}
