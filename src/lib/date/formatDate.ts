export function formatDateYMD(iso: string) {
  // iso가 비어있거나 이상하면 그대로 반환
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  // YYYY-MM-DD (로컬 타임존 기준)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
