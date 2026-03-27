export function customSortFunction({
  a,
  b,
  sortBy,
  type,
}: {
  a: string;
  b: string;
  sortBy: 'asc' | 'desc';
  type: 'text' | 'date';
}) {
  if (type === 'text') {
    if (sortBy === 'asc') {
      return a.localeCompare(b);
    } else {
      return b.localeCompare(a);
    }
  } else {
    if (sortBy === 'asc') {
      return new Date(a).getTime() - new Date(b).getTime();
    } else {
      return new Date(b).getTime() - new Date(a).getTime();
    }
  }
}
