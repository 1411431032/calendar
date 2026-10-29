/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Lock,
  Unlock,
  Edit2,
  Minus,
} from 'lucide-react';
import { ScheduleItem, TimeBlockTemplate, UserSettings } from '../types';
import {
  DAY_NAMES,
  getWeekDays,
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  findScheduleConflicts,
  snapMinutes,
} from '../utils/timeUtils';
import { COLOR_THEMES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface ViewTimetableProps {
  scheduleItems: ScheduleItem[];
  settings: UserSettings;
  templates: TimeBlockTemplate[];
  activePlacementTemplate: TimeBlockTemplate | null;
  onDropTemplateOnSlot: (tpl: TimeBlockTemplate, dayOfWeek: number, startTime: string) => void;
  onMoveItem: (itemId: string, newDayOfWeek: number, newStartTime: string) => void;
  onUpdateItemDuration?: (itemId: string, newDurationMinutes: number) => void;
  onSelectItem: (item: ScheduleItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleComplete: (itemId: string) => void;
  onOpenCreateWithSlot?: (dayOfWeek: number, startTime: string) => void;
}

export const ViewTimetable: React.FC<ViewTimetableProps> = ({
  scheduleItems,
  settings,
  templates,
  activePlacementTemplate,
  onDropTemplateOnSlot,
  onMoveItem,
  onUpdateItemDuration,
  onSelectItem,
  onDeleteItem,
  onToggleComplete,
  onOpenCreateWithSlot,
}) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [slotPicker, setSlotPicker] = useState<{ dayOfWeek: number; startTime: string } | null>(null);

  // Selected block for viewing details or adjusting duration
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Anti-misclick lock toggle (鎖定課表防誤觸)
  // When locked, dragging and edge-resizing are strictly disabled for 100% safe scrolling!
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // View scope: default 'workdays' (5 days) so entire week fits on mobile screen with zero scrolling!
  const [viewScope, setViewScope] = useState<'workdays' | 'all'>(
    settings.showWeekend ? 'all' : 'workdays'
  );

  const isDark = settings.darkMode;

  // Timetable hours range: 8:00 to 18:00 (expandable to 22:00)
  const [endHour, setEndHour] = useState<number>(18);
  const startHour = 8;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const HOUR_HEIGHT = 62; // px per hour for comfortable touch targets

  // Compute reference date
  const refDate = new Date();
  refDate.setDate(refDate.getDate() + currentWeekOffset * 7);
  const weekDays = getWeekDays(refDate);
  const visibleDays = viewScope === 'workdays' ? weekDays.slice(0, 5) : weekDays;

  // Conflict detection
  const conflictsMap = React.useMemo(() => findScheduleConflicts(scheduleItems), [scheduleItems]);

  // Pointer drag/move & edge-resize state
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [interactionState, setInteractionState] = useState<{
    type: 'move' | 'resize-bottom';
    itemId: string;
    initialY: number;
    initialStartTime: string;
    initialDuration: number;
    initialDayOfWeek: number;
    currentDayOfWeek: number;
    currentStartTime: string;
    currentDuration: number;
  } | null>(null);

  // Long-press tracking state for move prevention
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    item: ScheduleItem;
    element: HTMLElement;
    pointerId: number;
  } | null>(null);
  const [pressingItemId, setPressingItemId] = useState<string | null>(null);

  // Live Red Marker for today & current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTopPx = ((currentMinutes - startHour * 60) / 60) * HOUR_HEIGHT;

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Handle pointer down on block for moving (REQUIRES LONG PRESS to avoid misclicks during scrolling)
  const handleBlockPointerDown = (e: React.PointerEvent, item: ScheduleItem) => {
    if (e.button !== 0) return;
    if (isLocked) {
      // In locked mode, do not register drag; just tap to inspect
      return;
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const currentTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const clientX = e.clientX;
    const clientY = e.clientY;

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
      item,
      element: currentTarget,
      pointerId,
    };

    setPressingItemId(item.id);

    // Require 420ms long-press for touch devices (250ms for desktop mouse)
    const holdDuration = e.pointerType === 'touch' ? 420 : 250;

    longPressTimerRef.current = setTimeout(() => {
      if (!touchStartRef.current) return;

      try {
        currentTarget.setPointerCapture(pointerId);
      } catch (err) {
        // pointer capture fallback
      }

      triggerVibration([40, 50]);
      playChimeSound('drop');
      setPressingItemId(null);

      setInteractionState({
        type: 'move',
        itemId: item.id,
        initialY: clientY,
        initialStartTime: item.startTime,
        initialDuration: item.durationMinutes,
        initialDayOfWeek: item.dayOfWeek,
        currentDayOfWeek: item.dayOfWeek,
        currentStartTime: item.startTime,
        currentDuration: item.durationMinutes,
      });
      setSelectedItemId(item.id);
    }, holdDuration);
  };

  // Handle pointer down on bottom resize handle (ONLY available when block is selected)
  const handleResizePointerDown = (e: React.PointerEvent, item: ScheduleItem) => {
    if (e.button !== 0 || isLocked) return;
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // fallback
    }

    setInteractionState({
      type: 'resize-bottom',
      itemId: item.id,
      initialY: e.clientY,
      initialStartTime: item.startTime,
      initialDuration: item.durationMinutes,
      initialDayOfWeek: item.dayOfWeek,
      currentDayOfWeek: item.dayOfWeek,
      currentStartTime: item.startTime,
      currentDuration: item.durationMinutes,
    });
    triggerVibration([30]);
  };

  // Handle pointer move across container
  const handlePointerMove = (e: React.PointerEvent) => {
    // If long press is pending, check if user is scrolling (finger moved > 8px)
    if (touchStartRef.current && !interactionState) {
      const dist = Math.hypot(e.clientX - touchStartRef.current.x, e.clientY - touchStartRef.current.y);
      if (dist > 8) {
        // User moved finger > 8px, cancel long-press to allow normal smooth page scrolling
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        touchStartRef.current = null;
        setPressingItemId(null);
        return;
      }
    }

    if (!interactionState || !gridContainerRef.current) return;

    const deltaY = e.clientY - interactionState.initialY;
    const deltaMinutes = (deltaY / HOUR_HEIGHT) * 60;

    if (interactionState.type === 'resize-bottom') {
      // Resizing duration
      const rawNewDur = interactionState.initialDuration + deltaMinutes;
      const snappedDur = Math.max(20, Math.min(360, snapMinutes(rawNewDur, 5)));
      setInteractionState((prev) => (prev ? { ...prev, currentDuration: snappedDur } : null));
    } else if (interactionState.type === 'move') {
      // Moving up/down and left/right
      const initialStartM = timeToMinutes(interactionState.initialStartTime);
      const rawNewStartM = initialStartM + deltaMinutes;
      const clampedStartM = Math.max(startHour * 60, Math.min(endHour * 60 - 30, rawNewStartM));
      const snappedStartM = snapMinutes(clampedStartM, 5);

      // Check which day column cursor is over
      const rect = gridContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - 38; // subtract time column width (38px)
      const dayColWidth = (rect.width - 38) / visibleDays.length;
      const colIndex = Math.floor(relativeX / dayColWidth);
      const targetDay = visibleDays[Math.max(0, Math.min(visibleDays.length - 1, colIndex))].dayOfWeek;

      setInteractionState((prev) =>
        prev
          ? {
              ...prev,
              currentStartTime: minutesToTime(snappedStartM),
              currentDayOfWeek: targetDay,
            }
          : null
      );
    }
  };

  // Handle pointer up to finalize move, resize, or recognize quick tap selection
  const handlePointerUp = (e: React.PointerEvent) => {
    // If long-press timer was still waiting, this was a quick tap
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;

      if (touchStartRef.current) {
        const dist = Math.hypot(e.clientX - touchStartRef.current.x, e.clientY - touchStartRef.current.y);
        if (dist <= 8) {
          const tappedItem = touchStartRef.current.item;
          setSelectedItemId((prev) => (prev === tappedItem.id ? null : tappedItem.id));
          triggerVibration([15]);
        }
      }
    }

    touchStartRef.current = null;
    setPressingItemId(null);

    if (!interactionState) return;

    if (interactionState.type === 'move') {
      const { itemId, currentDayOfWeek, currentStartTime, initialDayOfWeek, initialStartTime } = interactionState;
      if (currentDayOfWeek !== initialDayOfWeek || currentStartTime !== initialStartTime) {
        onMoveItem(itemId, currentDayOfWeek, currentStartTime);
        playChimeSound('drop');
        triggerVibration([40]);
      }
    } else if (interactionState.type === 'resize-bottom') {
      const { itemId, currentDuration, initialDuration, currentStartTime } = interactionState;
      if (currentDuration !== initialDuration) {
        if (onUpdateItemDuration) {
          onUpdateItemDuration(itemId, currentDuration);
        } else {
          const newEndTime = calculateEndTime(currentStartTime, currentDuration);
          const target = scheduleItems.find((i) => i.id === itemId);
          if (target) {
            onMoveItem(itemId, target.dayOfWeek, target.startTime);
            target.durationMinutes = currentDuration;
            target.endTime = newEndTime;
            playChimeSound('drop');
            triggerVibration([40]);
          }
        }
      }
    }

    setInteractionState(null);
  };

  // Cell click for placing template or opening quick popover
  const handleColumnClick = (e: React.MouseEvent, dayOfWeek: number) => {
    if (interactionState) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickedMinute = startHour * 60 + (clickY / HOUR_HEIGHT) * 60;
    const snappedMinute = snapMinutes(clickedMinute, 10);
    const timeStr = minutesToTime(snappedMinute);

    if (activePlacementTemplate) {
      onDropTemplateOnSlot(activePlacementTemplate, dayOfWeek, timeStr);
      playChimeSound('drop');
      triggerVibration([50]);
    } else {
      setSlotPicker({ dayOfWeek, startTime: timeStr });
    }
  };

  // HTML5 Drop support from external drag (e.g. desktop drawer or FAB tray)
  const handleDropOnColumn = (e: React.DragEvent, dayOfWeek: number) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const tpl: TimeBlockTemplate = JSON.parse(data);
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickedMinute = startHour * 60 + (clickY / HOUR_HEIGHT) * 60;
        const snappedMinute = snapMinutes(clickedMinute, 10);
        const timeStr = minutesToTime(snappedMinute);

        onDropTemplateOnSlot(tpl, dayOfWeek, timeStr);
        playChimeSound('drop');
        triggerVibration([50]);
      }
    } catch (err) {
      console.error('Failed to parse dropped template:', err);
    }
  };

  const selectedItem = scheduleItems.find((i) => i.id === selectedItemId);

  return (
    <div
      ref={gridContainerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`flex flex-col h-full select-none relative overflow-hidden ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'
      }`}
    >
      {/* Week Header Navigation & Anti-Misclick Lock Toggle */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 border-b shrink-0 gap-1.5 ${
          isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        {/* Left: Week navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            className={`p-1 rounded-lg transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
            title="上一週"
            aria-label="上一週"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className={`font-bold text-xs px-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentWeekOffset === 0 ? '本週課表' : currentWeekOffset > 0 ? `第+${currentWeekOffset}週` : `第${currentWeekOffset}週`}
          </span>
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            className={`p-1 rounded-lg transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
            title="下一週"
            aria-label="下一週"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Anti-Misclick Lock Switcher (防誤觸鎖定按鈕) */}
        <button
          onClick={() => {
            setIsLocked(!isLocked);
            setSelectedItemId(null);
            triggerVibration([20]);
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition active:scale-95 ${
            isLocked
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300'
          }`}
          title={isLocked ? '課表已鎖定防止誤觸（點擊解鎖以排課）' : '排課模式中（長按移動，選中調時間）'}
        >
          {isLocked ? <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Unlock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
          <span>{isLocked ? '防誤觸鎖定' : '排課調整'}</span>
        </button>

        {/* Right: 5-day / 7-day switcher & 18h/22h range toggle */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setEndHour((prev) => (prev === 18 ? 22 : 18))}
            className={`px-1.5 py-0.5 rounded-md font-medium border transition ${
              endHour === 22
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                : 'text-slate-500 border-transparent hover:border-slate-300'
            }`}
            title="切換顯示至 18:00 或 22:00"
          >
            {endHour === 18 ? '至 18:00' : '至 22:00'}
          </button>

          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <button
              onClick={() => setViewScope('workdays')}
              className={`px-1.5 py-0.5 rounded-md font-medium transition ${
                viewScope === 'workdays'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              週一~五
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-1.5 py-0.5 rounded-md font-medium transition ${
                viewScope === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7天
            </button>
          </div>
        </div>
      </div>

      {/* Main Timetable: Fixed 100% width, NO HORIZONTAL SCROLL! */}
      <div className="flex-1 w-full flex flex-col overflow-y-auto overflow-x-hidden relative pb-28">
        {/* Sticky Day Column Headers across top */}
        <div
          className={`grid w-full border-b sticky top-0 z-20 backdrop-blur-md shadow-2xs ${
            isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'
          }`}
          style={{
            gridTemplateColumns: `38px repeat(${visibleDays.length}, minmax(0, 1fr))`,
          }}
        >
          {/* Time col header */}
          <div
            className={`p-1.5 text-center text-[10px] font-mono flex items-center justify-center border-r ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}
          >
            時間
          </div>

          {/* Days */}
          {visibleDays.map((d) => (
            <div
              key={d.dayOfWeek}
              className={`py-1.5 px-0.5 text-center border-r last:border-r-0 transition ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              } ${
                d.isToday && currentWeekOffset === 0
                  ? isDark
                    ? 'bg-indigo-600/15 border-b-2 border-b-indigo-500'
                    : 'bg-indigo-50/80 border-b-2 border-b-indigo-600'
                  : ''
              }`}
            >
              <div className={`text-[11px] font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {d.shortLabel}
              </div>
              <div
                className={`text-[9px] font-mono ${
                  d.isToday && currentWeekOffset === 0 ? 'text-indigo-600 font-bold' : 'text-slate-400'
                }`}
              >
                {d.month}/{d.dateNum}
              </div>
            </div>
          ))}
        </div>

        {/* Continuous Hour-Grid Body */}
        <div className="relative w-full flex-1" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
          {/* Hour Horizontal Grid Lines & Left Time Labels */}
          {hours.map((h, idx) => (
            <div
              key={h}
              className="absolute left-0 w-full flex pointer-events-none"
              style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
            >
              {/* Left Hour Time Label: 1-hour intervals */}
              <div
                className={`w-[38px] shrink-0 border-r border-b text-[10px] font-mono text-center pt-0.5 ${
                  isDark
                    ? 'border-slate-800/80 text-slate-400 bg-slate-900/40'
                    : 'border-slate-200 text-slate-500 bg-slate-50/70'
                }`}
              >
                {h}:00
              </div>
              {/* Grid cell horizontal dashed border */}
              <div className={`flex-1 border-b ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`} />
            </div>
          ))}

          {/* Day Columns Container */}
          <div
            className="absolute top-0 right-0 h-full grid"
            style={{
              left: '38px',
              gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))`,
            }}
          >
            {visibleDays.map((d) => {
              const isToday = d.isToday && currentWeekOffset === 0;
              const dayItems = scheduleItems.filter((item) => item.dayOfWeek === d.dayOfWeek);

              return (
                <div
                  key={d.dayOfWeek}
                  data-timetable-column={d.dayOfWeek}
                  data-timetable-colname={d.shortLabel}
                  onClick={(e) => handleColumnClick(e, d.dayOfWeek)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnColumn(e, d.dayOfWeek)}
                  className={`relative h-full border-r last:border-r-0 transition-colors ${
                    isDark ? 'border-slate-800/60' : 'border-slate-200/80'
                  } ${isToday ? (isDark ? 'bg-indigo-950/10' : 'bg-indigo-50/25') : ''} ${
                    activePlacementTemplate
                      ? isDark
                        ? 'hover:bg-amber-500/10 cursor-pointer'
                        : 'hover:bg-amber-50 cursor-pointer'
                      : ''
                  }`}
                >
                  {/* Current Live Time Red Line if today */}
                  {isToday && nowTopPx >= 0 && nowTopPx <= hours.length * HOUR_HEIGHT && (
                    <div
                      className="absolute left-0 w-full z-15 pointer-events-none flex items-center"
                      style={{ top: `${nowTopPx}px` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 -ml-0.5" />
                      <div className="h-[1.5px] w-full bg-rose-500 shadow-xs" />
                    </div>
                  )}

                  {/* Render Scheduled Blocks inside this day column */}
                  {dayItems.map((item) => {
                    const isInteracting = interactionState?.itemId === item.id;
                    const effectiveDay = isInteracting ? interactionState.currentDayOfWeek : item.dayOfWeek;

                    if (isInteracting && interactionState.type === 'move' && effectiveDay !== d.dayOfWeek) {
                      return null;
                    }

                    const effectiveStartTime = isInteracting ? interactionState.currentStartTime : item.startTime;
                    const effectiveDuration = isInteracting ? interactionState.currentDuration : item.durationMinutes;

                    const startM = timeToMinutes(effectiveStartTime);
                    const topPx = Math.max(0, ((startM - startHour * 60) / 60) * HOUR_HEIGHT);
                    const heightPx = Math.max(26, (effectiveDuration / 60) * HOUR_HEIGHT);

                    const theme = COLOR_THEMES[item.colorId] || COLOR_THEMES.indigo;
                    const hasConflict = conflictsMap.has(item.id);
                    const isSelected = selectedItemId === item.id;
                    const isPressing = pressingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        onPointerDown={(e) => handleBlockPointerDown(e, item)}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          background: isDark
                            ? `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)`
                            : `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}0d)`,
                          borderColor: isSelected
                            ? theme.accent
                            : isDark
                            ? `${theme.accent}70`
                            : `${theme.accent}55`,
                        }}
                        className={`absolute left-0.5 right-0.5 rounded-lg border shadow-2xs transition-all overflow-hidden flex flex-col justify-between p-1 select-none touch-none z-10 ${
                          isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                        } ${
                          isInteracting
                            ? 'ring-2 ring-indigo-500 shadow-2xl opacity-90 scale-[1.03] z-30'
                            : isSelected
                            ? 'ring-2 ring-indigo-500 shadow-md scale-[1.01] z-20'
                            : isPressing
                            ? 'scale-[0.98] opacity-80'
                            : 'hover:shadow-md'
                        } ${item.isCompleted ? 'opacity-60 line-through' : ''}`}
                      >
                        {/* Block Header: Title & Reminders */}
                        <div className="flex items-start justify-between gap-0.5 min-w-0">
                          <div className="flex items-start gap-1 min-w-0 flex-1">
                            <span
                              className={`font-bold text-[9px] sm:text-[10.5px] leading-[1.15] line-clamp-2 break-all ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                              title={item.title}
                            >
                              {item.title}
                            </span>
                          </div>

                          {/* Reminder icon */}
                          {item.reminderEnabled && (
                            <Bell className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                        </div>

                        {/* Block Middle: Exact Time & Location */}
                        <div className="min-w-0 my-auto">
                          <div
                            className={`text-[8px] font-mono leading-none truncate ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {effectiveStartTime}-{calculateEndTime(effectiveStartTime, effectiveDuration)}
                          </div>
                          {item.location && heightPx > 42 && (
                            <div className="flex items-center gap-0.5 text-[8px] text-slate-500 truncate mt-0.5">
                              <MapPin className="w-2 h-2 text-rose-500 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Overlap Conflict Tag */}
                        {hasConflict && heightPx > 36 && (
                          <div className="flex items-center gap-0.5 text-[7px] text-amber-600 dark:text-amber-400 font-bold leading-none">
                            <AlertTriangle className="w-2 h-2 shrink-0" />
                            <span>衝堂</span>
                          </div>
                        )}

                        {/* Bottom Resize Drag Handle: ONLY SHOWN & ACTIVE WHEN SELECTED AND UNLOCKED! */}
                        {isSelected && !isLocked && (
                          <div
                            onPointerDown={(e) => handleResizePointerDown(e, item)}
                            className="h-3.5 -mb-1 -mx-1 flex items-center justify-center cursor-ns-resize bg-indigo-600/20 dark:bg-indigo-400/25 hover:bg-indigo-600/35 rounded-b transition-colors border-t border-indigo-400/30 group/resize"
                            title="拖曳下邊緣調整課程時長"
                          >
                            <div className="w-5 h-1 rounded-full bg-indigo-600 dark:bg-indigo-300 shadow-2xs" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Item Floating Action Bar for Quick & Accurate Duration Adjustment */}
      {selectedItem && !interactionState && !isLocked && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-35 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-800 shadow-2xl rounded-2xl px-3 py-2 flex items-center gap-2 max-w-[94vw] animate-in fade-in slide-in-from-bottom-2 select-none">
          <div className="flex flex-col min-w-0 pr-1">
            <div className="font-bold text-xs truncate max-w-[100px] sm:max-w-[140px] text-slate-800 dark:text-white">
              {selectedItem.title}
            </div>
            <div className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400">
              {selectedItem.startTime} - {selectedItem.endTime} ({selectedItem.durationMinutes}分)
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => {
                if (onUpdateItemDuration) {
                  onUpdateItemDuration(selectedItem.id, selectedItem.durationMinutes - 15);
                }
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-95 flex items-center gap-0.5"
              title="減少 15 分鐘"
            >
              <Minus className="w-2.5 h-2.5" />
              <span>15分</span>
            </button>
            <button
              onClick={() => {
                if (onUpdateItemDuration) {
                  onUpdateItemDuration(selectedItem.id, selectedItem.durationMinutes + 15);
                }
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-95 flex items-center gap-0.5"
              title="增加 15 分鐘"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>15分</span>
            </button>
            <button
              onClick={() => onSelectItem(selectedItem)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>詳情</span>
            </button>
            <button
              onClick={() => setSelectedItemId(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Tooltip when actively moving or resizing */}
      {interactionState && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border border-slate-700 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {DAY_NAMES[interactionState.currentDayOfWeek].short}{' '}
            {interactionState.currentStartTime} -{' '}
            {calculateEndTime(interactionState.currentStartTime, interactionState.currentDuration)}{' '}
            ({interactionState.currentDuration}分)
          </span>
        </div>
      )}

      {/* Quick Slot Block Picker Modal (when clicking an empty cell) */}
      {slotPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className={`rounded-t-3xl sm:rounded-3xl w-full max-w-md p-4 shadow-2xl flex flex-col max-h-[80vh] border ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div>
                <h3 className="font-bold text-sm">
                  排入行程至 {DAY_NAMES[slotPicker.dayOfWeek].full} {slotPicker.startTime}
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  點選常用方塊直接放入，可自由長按滑動或調整時間
                </p>
              </div>
              <button
                onClick={() => setSlotPicker(null)}
                className={`p-1.5 rounded-full ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Template Grid */}
            <div className="py-3 overflow-y-auto space-y-2 flex-1">
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                選擇常用事情方塊：
              </span>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => {
                  const theme = COLOR_THEMES[tpl.colorId] || COLOR_THEMES.indigo;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        onDropTemplateOnSlot(tpl, slotPicker.dayOfWeek, slotPicker.startTime);
                        setSlotPicker(null);
                        playChimeSound('drop');
                        triggerVibration([50]);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition active:scale-95 ${
                        isDark
                          ? 'border-slate-700/60 bg-slate-800/60 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}88)`,
                        }}
                      >
                        <DynamicIcon name={tpl.iconName} className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {tpl.title}
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {tpl.defaultDuration}分
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom create button */}
            <div className={`pt-3 border-t flex gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => {
                  if (onOpenCreateWithSlot) {
                    onOpenCreateWithSlot(slotPicker.dayOfWeek, slotPicker.startTime);
                  }
                  setSlotPicker(null);
                }}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>自訂新行程</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
