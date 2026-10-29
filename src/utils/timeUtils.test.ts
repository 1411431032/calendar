/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  checkOverlap,
  findScheduleConflicts,
  calculateCategoryStats,
  snapMinutes,
  positionToTimeString,
  heightToDurationMinutes,
} from './timeUtils';
import { ScheduleItem } from '../types';

test('snapMinutes rounds to nearest 5 minutes', () => {
  assert.equal(snapMinutes(12, 5), 10);
  assert.equal(snapMinutes(13, 5), 15);
  assert.equal(snapMinutes(15, 5), 15);
});

test('positionToTimeString converts grid offset to snapped time', () => {
  // If hourHeight = 60px, 1px = 1 min
  // startHour = 8 (08:00)
  assert.equal(positionToTimeString(0, 60, 8, 5), '08:00');
  assert.equal(positionToTimeString(70, 60, 8, 5), '09:10');
  assert.equal(positionToTimeString(120, 60, 8, 5), '10:00');
});

test('heightToDurationMinutes computes duration from pixel height', () => {
  assert.equal(heightToDurationMinutes(60, 60, 5), 60);
  assert.equal(heightToDurationMinutes(170, 60, 5), 170);
  assert.equal(heightToDurationMinutes(5, 60, 5), 15); // min 15
});


test('timeToMinutes converts HH:MM to total minutes correctly', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('08:30'), 510);
  assert.equal(timeToMinutes('12:15'), 735);
  assert.equal(timeToMinutes('23:59'), 1439);
  assert.equal(timeToMinutes(''), 0);
});

test('minutesToTime formats minutes into standard HH:MM', () => {
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(510), '08:30');
  assert.equal(minutesToTime(735), '12:15');
  assert.equal(minutesToTime(1439), '23:59');
  assert.equal(minutesToTime(1500), '23:59'); // clamped
});

test('calculateEndTime handles durations correctly', () => {
  assert.equal(calculateEndTime('09:00', 50), '09:50');
  assert.equal(calculateEndTime('11:45', 30), '12:15');
  assert.equal(calculateEndTime('23:00', 120), '23:59');
});

test('checkOverlap accurately detects interval intersection', () => {
  // Overlapping intervals
  assert.equal(checkOverlap('09:00', '10:00', '09:30', '10:30'), true);
  assert.equal(checkOverlap('09:00', '11:00', '09:15', '09:45'), true);
  
  // Adjacent non-overlapping intervals
  assert.equal(checkOverlap('09:00', '10:00', '10:00', '11:00'), false);
  assert.equal(checkOverlap('10:00', '11:00', '08:00', '09:00'), false);
});

test('findScheduleConflicts detects overlapping classes on same day', () => {
  const items: ScheduleItem[] = [
    {
      id: 'item-1',
      title: '微積分',
      category: 'course',
      colorId: 'indigo',
      iconName: 'Calculator',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      isRecurringWeekly: true,
      reminderEnabled: true,
      reminderOffsetMinutes: 10,
    },
    {
      id: 'item-2',
      title: '晨跑健身',
      category: 'workout',
      colorId: 'emerald',
      iconName: 'Dumbbell',
      dayOfWeek: 1,
      startTime: '09:30', // Conflicts with item-1
      endTime: '10:30',
      durationMinutes: 60,
      isRecurringWeekly: true,
      reminderEnabled: false,
      reminderOffsetMinutes: 0,
    },
    {
      id: 'item-3',
      title: '圖書館自習',
      category: 'study',
      colorId: 'violet',
      iconName: 'BookOpen',
      dayOfWeek: 1,
      startTime: '14:00',
      endTime: '16:00',
      durationMinutes: 120,
      isRecurringWeekly: true,
      reminderEnabled: true,
      reminderOffsetMinutes: 15,
    },
    {
      id: 'item-4',
      title: '演算法',
      category: 'course',
      colorId: 'cyan',
      iconName: 'Code',
      dayOfWeek: 2, // Different day, no conflict with item-1 or 2
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      isRecurringWeekly: true,
      reminderEnabled: true,
      reminderOffsetMinutes: 10,
    },
  ];

  const conflicts = findScheduleConflicts(items);
  assert.equal(conflicts.has('item-1'), true);
  assert.equal(conflicts.has('item-2'), true);
  assert.equal(conflicts.has('item-3'), false);
  assert.equal(conflicts.has('item-4'), false);
  assert.deepEqual(conflicts.get('item-1'), ['item-2']);
});

test('calculateCategoryStats aggregates hours by category properly', () => {
  const items: ScheduleItem[] = [
    {
      id: '1',
      title: 'A',
      category: 'course',
      colorId: 'blue',
      iconName: 'Book',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 120,
      isRecurringWeekly: true,
      reminderEnabled: false,
      reminderOffsetMinutes: 0,
    },
    {
      id: '2',
      title: 'B',
      category: 'study',
      colorId: 'amber',
      iconName: 'Book',
      dayOfWeek: 2,
      startTime: '13:00',
      endTime: '14:30',
      durationMinutes: 90,
      isRecurringWeekly: true,
      reminderEnabled: false,
      reminderOffsetMinutes: 0,
    },
  ];

  const stats = calculateCategoryStats(items);
  assert.equal(stats.totalHours, 3.5);
  assert.equal(stats.categoryHours.course, 2);
  assert.equal(stats.categoryHours.study, 1.5);
});
