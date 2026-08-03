export function formatLocation(value?: string | null): string {
  if (!value) return '';

  const location = value.trim();
  if (/da\s*lat|đà\s*lạt/i.test(location)) return 'Đà Lạt';

  const district = location.match(/(?:quận|q\.?)[\s-]*(\d+)/i);
  if (district) return `Quận ${district[1]}`;
  if (/bình\s*chánh/i.test(location)) return 'Bình Chánh';

  return location;
}
