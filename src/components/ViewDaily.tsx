/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  Calendar,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { ScheduleItem, TimeBlockTemplate, UserSettings } from '../types';
import {
  DAY_NAMES,
  timeToMinutes,
  minutesToTime,
  getLiveItemStatus,
  formatDate,
} from '../utils/timeUtils';
import { COLOR_THEMES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface ViewDailyProps {
  scheduleItems: ScheduleItem[];
  settings: UserSettings;
  activePlacementTemplate: TimeBlockTemplate | null;
  onDropTemplateOnSlot: (tpl: TimeBlockTemplate, dayOfWeek: number, startTime: string) => void;
  onSelectItem: (item: ScheduleItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleComplete: (itemId: string) => void;
}

export const ViewDaily: React.FC<ViewDailyProps> = ({
  scheduleItems,
  settings,
  activePlacementTemplate,
  onDropTemplateOnSlot,
  onSelectItem,
  onDeleteItem,
  onToggleComplete,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = React.useState(0);
  const [dragOverHour, setDragOverHour] = React.useState<string | null>(null);

  const isDark = settings.darkMode;

  // Target date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const dayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay();
  const dateStr = formatDate(targetDate);
  const isToday = selectedDayOffset === 0;

  // Filter items for this day
  const dayItems = scheduleItems
    .filter((item) => item.dayOfWeek === dayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Hours range (07:00 to 22:00)
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  const handleDrop = (e: React.DragEvent, timeStr: string) => {
    e.preventDefault();
    setDragOverHour(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed.defaultDuration !== undefined) {
          onDropTemplateOnSlot(parsed as TimeBlockTemplate, dayOfWeek, timeStr);
          playChimeSound('drop');
          triggerVibration([40]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSlotClick = (timeStr: string) => {
    if (activePlacementTemplate) {
      onDropTemplateOnSlot(activePlacementTemplate, dayOfWeek, timeStr);
      playChimeSound('drop');
      triggerVibration([50]);
    }
  };

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* Date Navigation Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDayOffset((prev) => prev - 1)}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
            title="前一天"
            aria-label="前一天"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div>
            <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{DAY_NAMES[dayOfWeek].full}</span>
              <span className={`text-xs font-normal font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {targetDate.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
              </span>
              {isToday && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  今天
                </span>
              )}
            </h2>
          </div>

          <button
            onClick={() => setSelectedDayOffset((prev) => prev + 1)}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
            title="後一天"
            aria-label="後一天"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDayOffset(0)}
              className="text-xs text-indigo-600 dark:text-cyan-400 font-medium ml-2 underline"
            >
              回今天
            </button>
          )}
        </div>

        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          今日行程：<strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{dayItems.length}</strong> 項
        </div>
      </div>

      {/* Hourly Timeline View */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 relative">
        {hours.map((hour) => {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`;
          const hourMinutes = hour * 60;
          const isDragOver = dragOverHour === hourStr;

          const itemsInHour = dayItems.filter((item) => {
            const startM = timeToMinutes(item.startTime);
            return startM >= hourMinutes && startM < hourMinutes + 60;
          });

          const isCurrentHour = isToday && currentMinutes >= hourMinutes && currentMinutes < hourMinutes + 60;

          return (
            <div
              key={hour}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverHour(hourStr);
              }}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={(e) => handleDrop(e, hourStr)}
              onClick={() => handleSlotClick(hourStr)}
              className={`relative flex gap-3 py-2 border-b rounded-xl px-2 transition ${
                isDark ? 'border-slate-800/50' : 'border-slate-100'
              } ${
                isCurrentHour ? (isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : ''
              } ${
                isDragOver
                  ? 'bg-indigo-600/20 ring-2 ring-indigo-400'
                  : activePlacementTemplate
                  ? isDark
                    ? 'hover:bg-amber-500/10 cursor-pointer'
                    : 'hover:bg-amber-50 cursor-pointer'
                  : ''
              }`}
            >
              {/* Hour Label */}
              <div className="w-12 text-right shrink-0 pt-1">
                <span className={`font-mono text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hourStr}</span>
              </div>

              {/* Items Column */}
              <div className="flex-1 min-w-0 space-y-2">
                {itemsInHour.map((item) => {
                  const theme = COLOR_THEMES[item.colorId] || COLOR_THEMES.indigo;
                  const status = getLiveItemStatus(item, now);

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className={`rounded-2xl p-3 border shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] active:scale-95 ${
                        item.isCompleted ? 'opacity-60 line-through' : ''
                      }`}
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}15)`
                          : `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}0a)`,
                        borderColor: isDark ? `${theme.accent}66` : `${theme.accent}45`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}88)`,
                            }}
                          >
                            <DynamicIcon name={item.iconName} className="w-4 h-4 text-white" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item.title}
                              </h3>
                              {status.isOngoing && isToday && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" /> 進行中
                                </span>
                              )}
                            </div>

                            <div className={`flex items-center gap-3 text-xs mt-1 font-mono ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                {item.startTime} - {item.endTime} ({item.durationMinutes}m)
                              </span>
                              {item.location && (
                                <span className={`flex items-center gap-1 font-sans truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className={`text-[11px] mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                備忘：{item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Complete & Reminder */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.reminderEnabled && (
                            <span className="text-amber-500 p-1" title={`提早 ${item.reminderOffsetMinutes}m 提醒`}>
                              <Bell className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(item.id);
                              playChimeSound('success');
                              triggerVibration([80]);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              item.isCompleted
                                ? isDark
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : isDark
                                ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                                : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
                            }`}
                            title="標記完成"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slot tap prompt if placement is active */}
                {itemsInHour.length === 0 && activePlacementTemplate && (
                  <div className={`py-2.5 text-center text-xs font-medium border border-dashed rounded-xl ${
                    isDark ? 'text-amber-400/60 border-amber-500/25' : 'text-amber-700 border-amber-300 bg-amber-50/50'
                  }`}>
                    ＋ 放置 {activePlacementTemplate.title} 於此時段
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
