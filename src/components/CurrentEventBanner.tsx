/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  BellRing,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleItem } from '../types';
import { getLiveItemStatus, timeToMinutes } from '../utils/timeUtils';
import { COLOR_THEMES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface CurrentEventBannerProps {
  scheduleItems: ScheduleItem[];
  darkMode?: boolean;
  onToggleComplete: (itemId: string) => void;
  onSelectItem: (item: ScheduleItem) => void;
}

export const CurrentEventBanner: React.FC<CurrentEventBannerProps> = ({
  scheduleItems,
  darkMode = false,
  onToggleComplete,
  onSelectItem,
}) => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Check every 10s
    return () => clearInterval(timer);
  }, []);

  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayItems = scheduleItems.filter((item) => {
    return item.dayOfWeek === currentDayOfWeek;
  });

  todayItems.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  let ongoingItem: ScheduleItem | null = null;
  let nextItem: ScheduleItem | null = null;

  for (const item of todayItems) {
    const startM = timeToMinutes(item.startTime);
    const endM = timeToMinutes(item.endTime);
    if (currentMinutes >= startM && currentMinutes < endM) {
      ongoingItem = item;
      break;
    } else if (currentMinutes < startM && !nextItem) {
      nextItem = item;
    }
  }

  const activeItem = ongoingItem || nextItem;
  if (!activeItem) return null;

  const isOngoing = !!ongoingItem;
  const status = getLiveItemStatus(activeItem, now);
  const colorTheme = COLOR_THEMES[activeItem.colorId] || COLOR_THEMES.indigo;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(activeItem.id);
    playChimeSound('success');
    triggerVibration([120, 80, 150]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2 },
    });
  };

  return (
    <div
      onClick={() => onSelectItem(activeItem)}
      className={`mx-3 sm:mx-4 my-2.5 rounded-2xl p-3.5 sm:p-4 border shadow-sm transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
        darkMode
          ? isOngoing
            ? 'bg-slate-900 border-indigo-500/50 shadow-indigo-500/10'
            : 'bg-slate-900/90 border-slate-800'
          : isOngoing
          ? 'bg-white border-indigo-200 shadow-md shadow-indigo-100 ring-1 ring-indigo-100'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Background soft glow orb */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ backgroundColor: colorTheme.accent }}
      />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isOngoing ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 animate-pulse' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${colorTheme.accent}ee, ${colorTheme.accent}99)`,
            }}
          >
            <DynamicIcon name={activeItem.iconName} className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                  isOngoing
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isOngoing ? (
                  <>
                    <Flame className="w-3 h-3 text-amber-300 animate-bounce" />
                    進行中
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    下一節安排
                  </>
                )}
              </span>

              <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeItem.startTime} - {activeItem.endTime}
              </span>

              {activeItem.reminderEnabled && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  <BellRing className="w-3 h-3" />
                  提早 {activeItem.reminderOffsetMinutes}m
                </span>
              )}
            </div>

            <h3 className={`font-bold text-base sm:text-lg truncate flex items-center gap-1.5 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {activeItem.title}
              {activeItem.isCompleted && (
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                </span>
              )}
            </h3>

            {/* Location & instructor */}
            <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
              {activeItem.location && (
                <span className={`flex items-center gap-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{activeItem.location}</span>
                </span>
              )}
              {activeItem.instructor && (
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                  授課：{activeItem.instructor}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleComplete}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
              activeItem.isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                : darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${activeItem.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>{activeItem.isCompleted ? '已打卡' : '打卡'}</span>
          </button>

          {isOngoing ? (
            <span className={`text-[11px] font-medium flex items-center gap-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              剩餘 <strong className={`font-mono text-xs ${darkMode ? 'text-white' : 'text-slate-900'}`}>{status.remainingMinutes}</strong> 分鐘
            </span>
          ) : status.startsInMinutes !== null ? (
            <span className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              還有 <strong className="font-mono text-cyan-600 dark:text-cyan-300 text-xs">{status.startsInMinutes}</strong> 分
            </span>
          ) : null}
        </div>
      </div>

      {/* Progress bar if ongoing */}
      {isOngoing && (
        <div className={`mt-3 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
          <div className={`flex justify-between items-center text-[10px] mt-1 font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{activeItem.startTime}</span>
            <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{status.progressPercent}% 完成</span>
            <span>{activeItem.endTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};
