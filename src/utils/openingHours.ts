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

function isOvernightHours(startMinutes: number, endMinutes: number): boolean {
  return endMinutes <= startMinutes;
}

function toInterval(
  startMinutes: number,
  endMinutes: number,
  referenceStartMinutes = 0,
): [number, number] {
  const normalizedStart = startMinutes + referenceStartMinutes;
  const normalizedEnd =
    endMinutes + referenceStartMinutes + (isOvernightHours(startMinutes, endMinutes) ? 24 * 60 : 0);

  return [normalizedStart, normalizedEnd];
}

function toBreakInterval(
  breakStartMinutes: number,
  breakEndMinutes: number,
  startMinutes: number,
  endMinutes: number,
  referenceStartMinutes = 0,
): [number, number] {
  const isStoreOvernight = isOvernightHours(startMinutes, endMinutes);
  const breakStartsNextDay = isStoreOvernight && breakStartMinutes < startMinutes;
  const breakReferenceStart = referenceStartMinutes + (breakStartsNextDay ? 24 * 60 : 0);

  return toInterval(breakStartMinutes, breakEndMinutes, breakReferenceStart);
}

function isOpenAtMinutes(
  openingHour: OpeningHourLike,
  currentMinutes: number,
  referenceStartMinutes = 0,
): boolean {
  const startMinutes = toMinutes(openingHour.start_time);
  const endMinutes = toMinutes(openingHour.end_time);
  const breakStartMinutes = toMinutes(openingHour.break_start_time);
  const breakEndMinutes = toMinutes(openingHour.break_end_time);

  if (startMinutes == null || endMinutes == null) return false;

  const [openStart, openEnd] = toInterval(startMinutes, endMinutes, referenceStartMinutes);
  if (currentMinutes < openStart || currentMinutes >= openEnd) return false;

  if (breakStartMinutes != null && breakEndMinutes != null) {
    const [breakStart, breakEnd] = toBreakInterval(
      breakStartMinutes,
      breakEndMinutes,
      startMinutes,
      endMinutes,
      referenceStartMinutes,
    );

    if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
      return false;
    }
  }

  return true;
}

export function getIsStoreOpen(openingHours: OpeningHourLike[], now = new Date()): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();
  const previousDay = (today + 6) % 7;

  const todayHours = openingHours.filter((openingHour) => dayMap[openingHour.days] === today);
  const previousDayHours = openingHours.filter((openingHour) => dayMap[openingHour.days] === previousDay);

  const isOpenToday = todayHours.some(
    (openingHour) => !isClosedAllDay(openingHour) && isOpenAtMinutes(openingHour, currentMinutes),
  );

  if (isOpenToday) return true;

  return previousDayHours.some((openingHour) => {
    if (isClosedAllDay(openingHour)) return false;

    const startMinutes = toMinutes(openingHour.start_time);
    const endMinutes = toMinutes(openingHour.end_time);
    if (startMinutes == null || endMinutes == null || !isOvernightHours(startMinutes, endMinutes)) return false;

    return isOpenAtMinutes(openingHour, currentMinutes + 24 * 60);
  });
}
