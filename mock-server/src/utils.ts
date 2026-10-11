export interface Paginated<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number };
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total: items.length },
  };
}

export function parsePage(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}
