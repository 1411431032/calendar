/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'course' | 'study' | 'workout' | 'work' | 'club' | 'life' | 'exam';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  defaultColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface BlockColorTheme {
  id: string;
  name: string;
  gradient: string;      // Tailwind gradient classes or hex
  bg: string;            // Card background
  border: string;        // Border accent
  text: string;          // Main text color
  accent: string;        // Dot or highlight color
}

export interface TimeBlockTemplate {
  id: string;
  title: string;
  category: CategoryType;
  colorId: string;
  iconName: string;
  defaultDuration: number; // in minutes (e.g. 50, 90, 120)
  defaultLocation?: string;
  defaultNotes?: string;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number; // 0, 5, 10, 15, 30, 60
  isPinnedToFab?: boolean; // whether this block appears in the bottom-right FAB quick tray
}

export interface ScheduleItem {
  id: string;
  templateId?: string;
  title: string;
  category: CategoryType;
  colorId: string;
  iconName: string;
  
  // Weekly Timetable properties
  // dayOfWeek: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  dayOfWeek: number;
  startTime: string; // "HH:MM" e.g. "09:00"
  endTime: string;   // "HH:MM" e.g. "10:30"
  durationMinutes: number;
  
  // Location & notes
  location?: string;
  notes?: string;
  instructor?: string;
  
  // Specific date if this is a one-off calendar event; null/undefined for recurring weekly classes
  specificDate?: string; // "YYYY-MM-DD"
  isRecurringWeekly: boolean;

  // Reminders
  reminderEnabled: boolean;
  reminderOffsetMinutes: number;
  lastNotifiedAt?: string;

  // Task checkoff status
  isCompleted?: boolean;
}

export interface ReminderNotification {
  id: string;
  scheduleItemId: string;
  title: string;
  timeString: string;
  dayOrDate: string;
  location?: string;
  timestamp: number;
  isRead: boolean;
  type: 'upcoming' | 'started' | 'completed';
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  browserNotificationsEnabled: boolean;
  dndMode: boolean; // Do Not Disturb
  timetableStartHour: number; // default 8 (08:00)
  timetableEndHour: number;   // default 21 (21:00)
  showWeekend: boolean;       // default true
  usePeriodNumbers: boolean;  // show 第1節, 第2節 etc.
  phoneFrameMode: boolean;    // Preview inside phone chassis or full screen
  darkMode: boolean;          // default false (white background)
}

export type ActiveTab = 'timetable' | 'daily' | 'calendar' | 'blocks' | 'analytics';
