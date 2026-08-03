export function formatLocation(value?: string | null): string {
  if (!value) return '';

  const location = value.trim();
  if (/da\s*lat|đà\s*lạt/i.test(location)) return 'Đà Lạt';

  const district = location.match(/(?:quận|q\.?)[\s-]*(\d+)/i);
  if (district) return `Quận ${district[1]}`;
  if (/bình\s*chánh/i.test(location)) return 'Bình Chánh';

  return location;
}

export const LOCATION_ORDER = [
  ...Array.from({ length: 12 }, (_, index) => `Quận ${index + 1}`),
  'Bình Tân',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'TP Thủ Đức',
  'Bình Chánh',
  'Cần Giờ',
  'Củ Chi',
  'Hóc Môn',
  'Nhà Bè',
  'Grab Food',
  'Đà Lạt',
  'TP Khác',
] as const;

export function compareLocations(a: string, b: string): number {
  const aIndex = LOCATION_ORDER.indexOf(a as (typeof LOCATION_ORDER)[number]);
  const bIndex = LOCATION_ORDER.indexOf(b as (typeof LOCATION_ORDER)[number]);
  const aRank = aIndex === -1 ? Number.POSITIVE_INFINITY : aIndex;
  const bRank = bIndex === -1 ? Number.POSITIVE_INFINITY : bIndex;
  return aRank - bRank || a.localeCompare(b, 'vi');
}
