/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CategoryInfo,
  BlockColorTheme,
  TimeBlockTemplate,
  ScheduleItem,
  UserSettings,
} from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'course', label: '必選修課堂', defaultColor: 'indigo', badgeBg: 'bg-indigo-500/20', badgeText: 'text-indigo-400' },
  { id: 'study', label: '讀書與自習', defaultColor: 'violet', badgeBg: 'bg-violet-500/20', badgeText: 'text-violet-400' },
  { id: 'workout', label: '運動與健身', defaultColor: 'emerald', badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400' },
  { id: 'work', label: '打工與工作', defaultColor: 'amber', badgeBg: 'bg-amber-500/20', badgeText: 'text-amber-400' },
  { id: 'club', label: '社團與班會', defaultColor: 'fuchsia', badgeBg: 'bg-fuchsia-500/20', badgeText: 'text-fuchsia-400' },
  { id: 'life', label: '生活與休閒', defaultColor: 'cyan', badgeBg: 'bg-cyan-500/20', badgeText: 'text-cyan-400' },
  { id: 'exam', label: '考試與評量', defaultColor: 'red', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400' },
];

export const COLOR_THEMES: Record<string, BlockColorTheme> = {
  indigo: {
    id: 'indigo',
    name: '星曜湛藍',
    gradient: 'from-indigo-600/90 to-blue-700/90',
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-400/40',
    text: 'text-indigo-900',
    accent: '#4f46e5',
  },
  violet: {
    id: 'violet',
    name: '夢境紫羅蘭',
    gradient: 'from-purple-600/90 to-indigo-700/90',
    bg: 'bg-purple-50/80',
    border: 'border-purple-400/40',
    text: 'text-purple-900',
    accent: '#9333ea',
  },
  emerald: {
    id: 'emerald',
    name: '翡翠清新綠',
    gradient: 'from-emerald-600/90 to-teal-700/90',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-400/40',
    text: 'text-emerald-900',
    accent: '#059669',
  },
  amber: {
    id: 'amber',
    name: '暖曦澄橘',
    gradient: 'from-amber-500/90 to-orange-600/90',
    bg: 'bg-amber-50/80',
    border: 'border-amber-400/40',
    text: 'text-amber-900',
    accent: '#d97706',
  },
  rose: {
    id: 'rose',
    name: '玫瑰緋紅',
    gradient: 'from-rose-500/90 to-pink-700/90',
    bg: 'bg-rose-50/80',
    border: 'border-rose-400/40',
    text: 'text-rose-900',
    accent: '#e11d48',
  },
  cyan: {
    id: 'cyan',
    name: '極地冰青',
    gradient: 'from-cyan-500/90 to-teal-600/90',
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-400/40',
    text: 'text-cyan-900',
    accent: '#0891b2',
  },
  fuchsia: {
    id: 'fuchsia',
    name: '活潑洋紅',
    gradient: 'from-fuchsia-600/90 to-pink-600/90',
    bg: 'bg-fuchsia-50/80',
    border: 'border-fuchsia-400/40',
    text: 'text-fuchsia-900',
    accent: '#c026d3',
  },
  slate: {
    id: 'slate',
    name: '簡約沉穩灰',
    gradient: 'from-slate-700/90 to-zinc-800/90',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-800',
    accent: '#64748b',
  },
};

// Templates generated from user's actual curriculum (台中科大 115年上)
export const DEFAULT_TEMPLATES: TimeBlockTemplate[] = [
  {
    id: 'tpl-c1',
    title: '資料結構',
    category: 'course',
    colorId: 'indigo',
    iconName: 'Code',
    defaultDuration: 170, // 09:10 - 12:00
    defaultLocation: '中科大 專業教室',
    defaultNotes: '每週一連三節 (9:10-12:00)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c2',
    title: '行銷管理',
    category: 'course',
    colorId: 'amber',
    iconName: 'Briefcase',
    defaultDuration: 170, // 09:10 - 12:00
    defaultLocation: '中科大 系館',
    defaultNotes: '每週二連三節 (9:10-12:00)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c3',
    title: '統計學',
    category: 'course',
    colorId: 'cyan',
    iconName: 'Calculator',
    defaultDuration: 165, // 13:25 - 16:10
    defaultLocation: '中科大 教室',
    defaultNotes: '每週二 (13:25-16:10)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c4',
    title: 'JAVA程式設計',
    category: 'course',
    colorId: 'emerald',
    iconName: 'Laptop',
    defaultDuration: 165, // 13:25 - 16:10
    defaultLocation: '資工電腦教室',
    defaultNotes: '每週五上機實作 (13:25-16:10)',
    reminderEnabled: true,
    reminderOffsetMinutes: 15,
  },
  {
    id: 'tpl-c5',
    title: '電腦繪圖',
    category: 'course',
    colorId: 'rose',
    iconName: 'PenTool',
    defaultDuration: 170, // 09:10 - 12:00
    defaultLocation: '設計電腦教室',
    defaultNotes: '每週五連三節 (9:10-12:00)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c6',
    title: '生涯運動 (飛鏢)',
    category: 'workout',
    colorId: 'emerald',
    iconName: 'Dumbbell',
    defaultDuration: 105, // 15:20 - 17:05
    defaultLocation: '體育場館',
    defaultNotes: '每週一 (15:20-17:05)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c7',
    title: '民主憲政與法治',
    category: 'course',
    colorId: 'violet',
    iconName: 'BookOpen',
    defaultDuration: 105, // 13:25 - 15:10
    defaultLocation: '中科大 教室',
    defaultNotes: '每週一 (13:25-15:10)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c8',
    title: '語言與創意學習 (人文領域)',
    category: 'course',
    colorId: 'rose',
    iconName: 'Languages',
    defaultDuration: 110, // 10:10 - 12:00
    defaultLocation: '通識教學館',
    defaultNotes: '每週三 (10:10-12:00)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c9',
    title: '英語聽力與閱讀 (一)',
    category: 'course',
    colorId: 'indigo',
    iconName: 'Languages',
    defaultDuration: 105, // 13:25 - 15:10
    defaultLocation: '外語教室',
    defaultNotes: '每週三 (13:25-15:10)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c10',
    title: '衛星導航科技 (自然科學領域)',
    category: 'course',
    colorId: 'cyan',
    iconName: 'Compass',
    defaultDuration: 105, // 15:20 - 17:05
    defaultLocation: '科技大樓',
    defaultNotes: '每週三 (15:20-17:05)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c11',
    title: '週會/班會',
    category: 'club',
    colorId: 'fuchsia',
    iconName: 'Sparkles',
    defaultDuration: 105, // 15:20 - 17:05
    defaultLocation: '班級教室',
    defaultNotes: '每週四 (15:20-17:05)',
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'tpl-c12',
    title: '圖書館自習與複習',
    category: 'study',
    colorId: 'violet',
    iconName: 'BookOpen',
    defaultDuration: 120,
    defaultLocation: '中科大圖書館',
    defaultNotes: '寫作業複習',
    reminderEnabled: false,
    reminderOffsetMinutes: 0,
  },
];

// Exact timetable from user image (國立臺中科技大學 115年上 林詩哲 1411431032)
export const DEFAULT_SCHEDULE_ITEMS: ScheduleItem[] = [
  // 週一
  {
    id: 'ntc-mon-1',
    templateId: 'tpl-c1',
    title: '資料結構',
    category: 'course',
    colorId: 'indigo',
    iconName: 'Code',
    dayOfWeek: 1,
    startTime: '09:10',
    endTime: '12:00',
    durationMinutes: 170,
    location: '中科大 專業教室',
    notes: '09:10-12:00 (連三節: 9:10-10:00, 10:10-11:00, 11:10-12:00)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-mon-2',
    templateId: 'tpl-c7',
    title: '民主憲政與法治',
    category: 'course',
    colorId: 'violet',
    iconName: 'BookOpen',
    dayOfWeek: 1,
    startTime: '13:25',
    endTime: '15:10',
    durationMinutes: 105,
    location: '中科大 教室',
    notes: '13:25-15:10 (連兩節: 13:25-14:15, 14:20-15:10)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-mon-3',
    templateId: 'tpl-c6',
    title: '生涯運動 (飛鏢)',
    category: 'workout',
    colorId: 'emerald',
    iconName: 'Dumbbell',
    dayOfWeek: 1,
    startTime: '15:20',
    endTime: '17:05',
    durationMinutes: 105,
    location: '體育館飛鏢教室',
    notes: '15:20-17:05 (連兩節: 15:20-16:10, 16:15-17:05)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },

  // 週二
  {
    id: 'ntc-tue-1',
    templateId: 'tpl-c2',
    title: '行銷管理',
    category: 'course',
    colorId: 'amber',
    iconName: 'Briefcase',
    dayOfWeek: 2,
    startTime: '09:10',
    endTime: '12:00',
    durationMinutes: 170,
    location: '中科大 系館',
    notes: '09:10-12:00 (連三節: 9:10-10:00, 10:10-11:00, 11:10-12:00)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-tue-2',
    templateId: 'tpl-c3',
    title: '統計學',
    category: 'course',
    colorId: 'cyan',
    iconName: 'Calculator',
    dayOfWeek: 2,
    startTime: '13:25',
    endTime: '16:10',
    durationMinutes: 165,
    location: '中科大 教室',
    notes: '13:25-16:10 (連三節: 13:25-14:15, 14:20-15:10, 15:20-16:10)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },

  // 週三
  {
    id: 'ntc-wed-1',
    templateId: 'tpl-c8',
    title: '語言與創意學習 (人文領域)',
    category: 'course',
    colorId: 'rose',
    iconName: 'Languages',
    dayOfWeek: 3,
    startTime: '10:10',
    endTime: '12:00',
    durationMinutes: 110,
    location: '通識教學館',
    notes: '10:10-12:00 (連兩節: 10:10-11:00, 11:10-12:00)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-wed-2',
    templateId: 'tpl-c9',
    title: '英語聽力與閱讀 (一)',
    category: 'course',
    colorId: 'indigo',
    iconName: 'Languages',
    dayOfWeek: 3,
    startTime: '13:25',
    endTime: '15:10',
    durationMinutes: 105,
    location: '外語教室',
    notes: '13:25-15:10 (連兩節: 13:25-14:15, 14:20-15:10)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-wed-3',
    templateId: 'tpl-c10',
    title: '衛星導航科技 (自然科學領域)',
    category: 'course',
    colorId: 'cyan',
    iconName: 'Compass',
    dayOfWeek: 3,
    startTime: '15:20',
    endTime: '17:05',
    durationMinutes: 105,
    location: '科技大樓',
    notes: '15:20-17:05 (連兩節: 15:20-16:10, 16:15-17:05)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },

  // 週四
  {
    id: 'ntc-thu-1',
    templateId: 'tpl-c11',
    title: '週會/班會',
    category: 'club',
    colorId: 'fuchsia',
    iconName: 'Sparkles',
    dayOfWeek: 4,
    startTime: '15:20',
    endTime: '17:05',
    durationMinutes: 105,
    location: '班級教室',
    notes: '15:20-17:05 (連兩節: 15:20-16:10, 16:15-17:05)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },

  // 週五
  {
    id: 'ntc-fri-1',
    templateId: 'tpl-c5',
    title: '電腦繪圖',
    category: 'course',
    colorId: 'rose',
    iconName: 'PenTool',
    dayOfWeek: 5,
    startTime: '09:10',
    endTime: '12:00',
    durationMinutes: 170,
    location: '設計電腦教室',
    notes: '09:10-12:00 (連三節: 9:10-10:00, 10:10-11:00, 11:10-12:00)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 10,
  },
  {
    id: 'ntc-fri-2',
    templateId: 'tpl-c4',
    title: 'JAVA程式設計',
    category: 'course',
    colorId: 'emerald',
    iconName: 'Laptop',
    dayOfWeek: 5,
    startTime: '13:25',
    endTime: '16:10',
    durationMinutes: 165,
    location: '資工系電腦教室',
    notes: '13:25-16:10 (連三節: 13:25-14:15, 14:20-15:10, 15:20-16:10)',
    isRecurringWeekly: true,
    reminderEnabled: true,
    reminderOffsetMinutes: 15,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  browserNotificationsEnabled: false,
  dndMode: false,
  timetableStartHour: 8,
  timetableEndHour: 18, // 8:00 to 18:00 (matching university schedule)
  showWeekend: false,   // Default 5-day Mon-Fri view so all days fit on phone screen with zero scrolling!
  usePeriodNumbers: false, // Show time only by default as requested!
  phoneFrameMode: false,
  darkMode: false,     // White background
};

const STORAGE_KEYS = {
  TEMPLATES: 'timeblock_templates_ntc_v2',
  SCHEDULE: 'timeblock_schedule_ntc_v2',
  SETTINGS: 'timeblock_settings_ntc_v2',
  READ_NOTIFS: 'timeblock_read_notifications_ntc_v2',
};

export function loadTemplates(): TimeBlockTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: TimeBlockTemplate) => ({
          ...t,
          isPinnedToFab: t.isPinnedToFab !== undefined ? t.isPinnedToFab : true,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage:', e);
  }
  return DEFAULT_TEMPLATES.map((t) => ({
    ...t,
    isPinnedToFab: t.isPinnedToFab !== undefined ? t.isPinnedToFab : true,
  }));
}

export function saveTemplates(templates: TimeBlockTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates:', e);
  }
}

export function loadSchedule(): ScheduleItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load schedule from localStorage:', e);
  }
  return DEFAULT_SCHEDULE_ITEMS;
}

export function saveSchedule(schedule: ScheduleItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error('Failed to save schedule:', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/**
 * Generate iCalendar .ics format for exporting to Google/Apple Calendar
 */
export function exportToICS(items: ScheduleItem[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TimeBlock Schedule//TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:臺中科大課表與行事曆',
    'X-WR-TIMEZONE:Asia/Taipei',
  ];

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const curr = new Date();
  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const baseMonday = new Date(curr);
  baseMonday.setDate(curr.getDate() + diffToMonday);

  for (const item of items) {
    const itemDay = item.dayOfWeek;
    const targetDate = new Date(baseMonday);
    targetDate.setDate(baseMonday.getDate() + (itemDay - 1));

    const dateStr = targetDate.toISOString().slice(0, 10).replace(/-/g, '');
    const startStr = item.startTime.replace(':', '') + '00';
    const endStr = item.endTime.replace(':', '') + '00';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}@timeblock.app`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${dateStr}T${startStr}`);
    lines.push(`DTEND:${dateStr}T${endStr}`);
    lines.push(`SUMMARY:${item.title}`);
    if (item.location) lines.push(`LOCATION:${item.location}`);
    if (item.notes) lines.push(`DESCRIPTION:${item.notes.replace(/\n/g, '\\n')}`);
    if (item.isRecurringWeekly) {
      lines.push('RRULE:FREQ=WEEKLY;INTERVAL=1');
    }
    if (item.reminderEnabled) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:提醒: ${item.title}`);
      lines.push(`TRIGGER:-PT${item.reminderOffsetMinutes}M`);
      lines.push('END:VALARM');
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
