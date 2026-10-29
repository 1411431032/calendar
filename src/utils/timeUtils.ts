/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScheduleItem, CategoryType } from '../types';

/**
 * Converts "HH:MM" string to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

/**
 * Converts minutes from midnight to "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.round(minutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculates end time string from start time and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startM = timeToMinutes(startTime);
  const endM = Math.min(1439, startM + durationMinutes);
  return minutesToTime(endM);
}

/**
 * Checks if two time periods overlap
 */
export function checkOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

/**
 * Snaps minutes to nearest interval (e.g. 5 mins)
 */
export function snapMinutes(minutes: number, interval = 5): number {
  return Math.round(minutes / interval) * interval;
}

/**
 * Converts pixel offset in hour-grid to time string
 */
export function positionToTimeString(
  offsetY: number,
  hourHeight: number,
  startHour = 8,
  snapInterval = 5
): string {
  const rawMinutes = startHour * 60 + (offsetY / hourHeight) * 60;
  const clamped = Math.max(startHour * 60, Math.min(1380, rawMinutes));
  const snapped = snapMinutes(clamped, snapInterval);
  return minutesToTime(snapped);
}

/**
 * Calculates duration from pixel height
 */
export function heightToDurationMinutes(
  height: number,
  hourHeight: number,
  snapInterval = 5
): number {
  const rawMinutes = (height / hourHeight) * 60;
  const snapped = snapMinutes(rawMinutes, snapInterval);
  return Math.max(15, Math.min(480, snapped)); // min 15 mins
}

/**
 * Day of week naming helpers
 * 1 = Mon, 7 = Sun
 */
export const DAY_NAMES: Record<number, { full: string; short: string; en: string }> = {
  1: { full: '星期一', short: '週一', en: 'Mon' },
  2: { full: '星期二', short: '週二', en: 'Tue' },
  3: { full: '星期三', short: '週三', en: 'Wed' },
  4: { full: '星期四', short: '週四', en: 'Thu' },
  5: { full: '星期五', short: '週五', en: 'Fri' },
  6: { full: '星期六', short: '週六', en: 'Sat' },
  7: { full: '星期日', short: '週日', en: 'Sun' },
};

export const STANDARD_PERIODS = [
  { period: 1, name: '第1節', start: '08:10', end: '09:00' },
  { period: 2, name: '第2節', start: '09:10', end: '10:00' },
  { period: 3, name: '第3節', start: '10:20', end: '11:10' },
  { period: 4, name: '第4節', start: '11:20', end: '12:10' },
  { period: 5, name: '午休', start: '12:10', end: '13:10' },
  { period: 6, name: '第5節', start: '13:20', end: '14:10' },
  { period: 7, name: '第6節', start: '14:20', end: '15:10' },
  { period: 8, name: '第7節', start: '15:30', end: '16:20' },
  { period: 9, name: '第8節', start: '16:30', end: '17:20' },
  { period: 10, name: '第9節', start: '17:30', end: '18:20' },
  { period: 11, name: '夜間A', start: '18:30', end: '19:45' },
  { period: 12, name: '夜間B', start: '20:00', end: '21:15' },
];

/**
 * Returns formatted "YYYY-MM-DD" string
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get days of current week (starting Monday)
 */
export function getWeekDays(referenceDate: Date = new Date()) {
  const curr = new Date(referenceDate);
  // getDay(): 0 is Sunday, 1 is Monday ...
  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + diffToMonday);

  const todayStr = formatDate(new Date());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDate(d);
    const dayOfWeek = i + 1; // 1 to 7
    days.push({
      dayOfWeek,
      dateStr,
      dateObj: d,
      month: d.getMonth() + 1,
      dateNum: d.getDate(),
      fullLabel: DAY_NAMES[dayOfWeek].full,
      shortLabel: DAY_NAMES[dayOfWeek].short,
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

/**
 * Calendar month grid generation
 */
export function getMonthCalendarGrid(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  
  // What day of week is 1st of month (0 is Sun, 1 is Mon...)
  let startDayOfWeek = firstDay.getDay(); // 0-6
  const mondayStartCol = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0=Mon, 6=Sun

  const totalDays = lastDay.getDate();
  const gridCells = [];
  const todayStr = formatDate(new Date());

  // Prev month padding
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = mondayStartCol - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, monthIndex - 1, dayNum);
    gridCells.push({
      dateStr: formatDate(d),
      dayNum,
      isCurrentMonth: false,
      isToday: formatDate(d) === todayStr,
      dateObj: d,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, monthIndex, i);
    const dateStr = formatDate(d);
    gridCells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dateObj: d,
    });
  }

  // Next month padding to fill complete rows of 7
  let nextDayNum = 1;
  while (gridCells.length % 7 !== 0 || gridCells.length < 35) {
    const d = new Date(year, monthIndex + 1, nextDayNum);
    gridCells.push({
      dateStr: formatDate(d),
      dayNum: nextDayNum,
      isCurrentMonth: false,
      isToday: formatDate(d) === todayStr,
      dateObj: d,
    });
    nextDayNum++;
  }

  return gridCells;
}

/**
 * Checks status of an item relative to current live time
 */
export function getLiveItemStatus(item: ScheduleItem, now: Date = new Date()) {
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const todayStr = formatDate(now);
  
  // Check if item applies to today
  const isTodayEvent = item.specificDate ? item.specificDate === todayStr : (item.dayOfWeek === currentDayOfWeek);
  
  if (!isTodayEvent) {
    return {
      isActiveToday: false,
      isOngoing: false,
      isPast: false,
      isUpcoming: false,
      progressPercent: 0,
      remainingMinutes: 0,
      startsInMinutes: null as number | null,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startM = timeToMinutes(item.startTime);
  const endM = timeToMinutes(item.endTime);

  const isOngoing = currentMinutes >= startM && currentMinutes < endM;
  const isPast = currentMinutes >= endM;
  const isUpcoming = currentMinutes < startM;

  let progressPercent = 0;
  let remainingMinutes = 0;
  if (isOngoing) {
    const elapsed = currentMinutes - startM;
    const total = endM - startM || 1;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    remainingMinutes = endM - currentMinutes;
  }

  const startsInMinutes = isUpcoming ? startM - currentMinutes : null;

  return {
    isActiveToday: true,
    isOngoing,
    isPast,
    isUpcoming,
    progressPercent,
    remainingMinutes,
    startsInMinutes,
  };
}

/**
 * Detect conflicts in items on the same day
 */
export function findScheduleConflicts(items: ScheduleItem[]): Map<string, string[]> {
  const conflictsMap = new Map<string, string[]>();
  
  // Group by dayOfWeek
  const dayGroups: Record<number, ScheduleItem[]> = {};
  for (const item of items) {
    if (!dayGroups[item.dayOfWeek]) {
      dayGroups[item.dayOfWeek] = [];
    }
    dayGroups[item.dayOfWeek].push(item);
  }

  for (const dayItems of Object.values(dayGroups)) {
    for (let i = 0; i < dayItems.length; i++) {
      for (let j = i + 1; j < dayItems.length; j++) {
        const itemA = dayItems[i];
        const itemB = dayItems[j];
        if (checkOverlap(itemA.startTime, itemA.endTime, itemB.startTime, itemB.endTime)) {
          // Both have conflict
          if (!conflictsMap.has(itemA.id)) conflictsMap.set(itemA.id, []);
          if (!conflictsMap.has(itemB.id)) conflictsMap.set(itemB.id, []);
          conflictsMap.get(itemA.id)!.push(itemB.id);
          conflictsMap.get(itemB.id)!.push(itemA.id);
        }
      }
    }
  }

  return conflictsMap;
}

/**
 * Calculate weekly analytics
 */
export function calculateCategoryStats(items: ScheduleItem[]) {
  const categoryHours: Record<CategoryType, number> = {
    course: 0,
    study: 0,
    workout: 0,
    work: 0,
    club: 0,
    life: 0,
    exam: 0,
  };

  let totalMinutes = 0;

  for (const item of items) {
    const dur = item.durationMinutes || (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
    const cat = item.category || 'course';
    if (categoryHours[cat] !== undefined) {
      categoryHours[cat] += dur / 60;
    } else {
      categoryHours.course += dur / 60;
    }
    totalMinutes += dur;
  }

  return {
    categoryHours,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    totalItems: items.length,
  };
}
