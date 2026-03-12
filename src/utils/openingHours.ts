type LocalTimeLike = {
  hour?: number;
  minute?: number;
  second?: number;
};

type OpeningHourLike = {
  days: string;
  start_time?: string | LocalTimeLike | null;
  end_time?: string | LocalTimeLike | null;
  break_start_time?: string | LocalTimeLike | null;
  break_end_time?: string | LocalTimeLike | null;
};

const dayMap: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};

function toMinutes(value: string | LocalTimeLike | null | undefined): number | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized || normalized === '정기휴무') return null;

    const parts = normalized.split(':').map((part) => Number.parseInt(part, 10));
    if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) return null;

    return parts[0] * 60 + parts[1];
  }

  if (typeof value.hour !== 'number' || typeof value.minute !== 'number') return null;
  return value.hour * 60 + value.minute;
}

export function formatOpeningTime(value: string | LocalTimeLike | null | undefined): string {
  const minutes = toMinutes(value);
  if (minutes == null) return '';

  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function isClosedAllDay(openingHour: OpeningHourLike): boolean {
  return toMinutes(openingHour.start_time) == null || toMinutes(openingHour.end_time) == null;
}

export function getIsStoreOpen(openingHours: OpeningHourLike[], now = new Date()): boolean {
  const todayHours = openingHours.find((openingHour) => dayMap[openingHour.days] === now.getDay());
  if (!todayHours || isClosedAllDay(todayHours)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = toMinutes(todayHours.start_time);
  const endMinutes = toMinutes(todayHours.end_time);
  const breakStartMinutes = toMinutes(todayHours.break_start_time);
  const breakEndMinutes = toMinutes(todayHours.break_end_time);

  if (startMinutes == null || endMinutes == null) return false;
  if (currentMinutes < startMinutes || currentMinutes >= endMinutes) return false;

  if (
    breakStartMinutes != null &&
    breakEndMinutes != null &&
    currentMinutes >= breakStartMinutes &&
    currentMinutes < breakEndMinutes
  ) {
    return false;
  }

  return true;
}
