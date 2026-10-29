/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ScheduleItem, TimeBlockTemplate, UserSettings } from '../types';
import {
  getMonthCalendarGrid,
  formatDate,
  timeToMinutes,
  DAY_NAMES,
} from '../utils/timeUtils';
import { COLOR_THEMES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound } from '../utils/sound';

interface ViewCalendarProps {
  scheduleItems: ScheduleItem[];
  settings: UserSettings;
  activePlacementTemplate: TimeBlockTemplate | null;
  onDropTemplateOnSlot: (tpl: TimeBlockTemplate, dayOfWeek: number, startTime: string) => void;
  onSelectItem: (item: ScheduleItem) => void;
  onOpenCreateItemWithDate: (dateStr: string, dayOfWeek: number) => void;
}

export const ViewCalendar: React.FC<ViewCalendarProps> = ({
  scheduleItems,
  settings,
  activePlacementTemplate,
  onDropTemplateOnSlot,
  onSelectItem,
  onOpenCreateItemWithDate,
}) => {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState(new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = React.useState(formatDate(new Date()));

  const isDark = settings.darkMode;

  const monthGrid = React.useMemo(() => {
    return getMonthCalendarGrid(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  // Find events for selected date
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDayOfWeek = selectedDateObj.getDay() === 0 ? 7 : selectedDateObj.getDay();

  const selectedDayItems = scheduleItems.filter((item) => {
    if (item.specificDate) {
      return item.specificDate === selectedDateStr;
    }
    return item.dayOfWeek === selectedDayOfWeek;
  });

  selectedDayItems.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const handleCellClick = (dateStr: string, dObj: Date) => {
    setSelectedDateStr(dateStr);
    const dayOfWeek = dObj.getDay() === 0 ? 7 : dObj.getDay();

    if (activePlacementTemplate) {
      onDropTemplateOnSlot(activePlacementTemplate, dayOfWeek, '09:00');
      playChimeSound('drop');
    }
  };

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* Calendar Month Navigation Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
            title="上個月"
            aria-label="上個月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className={`font-bold text-sm sm:text-base font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentYear}年 {currentMonthIndex + 1}月
          </h2>

          <button
            onClick={handleNextMonth}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
            title="下個月"
            aria-label="下個月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            const today = new Date();
            setCurrentYear(today.getFullYear());
            setCurrentMonthIndex(today.getMonth());
            setSelectedDateStr(formatDate(today));
          }}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
            isDark
              ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
              : 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          今天
        </button>
      </div>

      {/* Main Grid View */}
      <div className="p-2 sm:p-4 shrink-0">
        {/* Day of Week Labels */}
        <div className={`grid grid-cols-7 text-center mb-1 text-[11px] font-bold ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <div>週一</div>
          <div>週二</div>
          <div>週三</div>
          <div>週四</div>
          <div>週五</div>
          <div className="text-amber-500">週六</div>
          <div className="text-rose-500">週日</div>
        </div>

        {/* 7-col Day Grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((cell) => {
            const isSelected = cell.dateStr === selectedDateStr;
            const cellDayOfWeek = cell.dateObj.getDay() === 0 ? 7 : cell.dateObj.getDay();

            const dayEvents = scheduleItems.filter((item) => {
              if (item.specificDate) return item.specificDate === cell.dateStr;
              return item.dayOfWeek === cellDayOfWeek;
            });

            return (
              <div
                key={cell.dateStr}
                onClick={() => handleCellClick(cell.dateStr, cell.dateObj)}
                className={`min-h-[52px] sm:min-h-[64px] rounded-xl p-1 sm:p-1.5 border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                      : 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30'
                    : cell.isCurrentMonth
                    ? isDark
                      ? 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60'
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
                    : isDark
                    ? 'border-slate-900 bg-slate-950/40 text-slate-600'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isSelected
                        ? 'text-indigo-600 font-bold'
                        : cell.isCurrentMonth
                        ? isDark ? 'text-slate-300' : 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className={`text-[9px] font-mono font-bold hidden sm:inline ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {dayEvents.length}項
                    </span>
                  )}
                </div>

                {/* Event Dots */}
                <div className="flex items-center gap-1 mt-1 overflow-hidden flex-wrap max-h-[14px]">
                  {dayEvents.slice(0, 4).map((ev) => {
                    const theme = COLOR_THEMES[ev.colorId] || COLOR_THEMES.indigo;
                    return (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accent }}
                        title={ev.title}
                      />
                    );
                  })}
                  {dayEvents.length > 4 && (
                    <span className="text-[8px] text-slate-400 font-mono">+</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer (Bottom half) */}
      <div className={`flex-1 border-t p-3 sm:p-4 overflow-y-auto ${
        isDark ? 'bg-slate-900/90 border-slate-800/80' : 'bg-slate-50/90 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{selectedDateStr} ({DAY_NAMES[selectedDayOfWeek].full})</span>
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                共 {selectedDayItems.length} 項行程
              </span>
            </h3>
          </div>

          <button
            onClick={() => onOpenCreateItemWithDate(selectedDateStr, selectedDayOfWeek)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增至今日</span>
          </button>
        </div>

        {/* Selected day items list */}
        {selectedDayItems.length === 0 ? (
          <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            這天尚無排定行程，可拖曳常用方塊或點擊「新增至今日」加入課表！
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayItems.map((item) => {
              const theme = COLOR_THEMES[item.colorId] || COLOR_THEMES.indigo;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`rounded-xl border p-2.5 flex items-center justify-between gap-3 cursor-pointer transition shadow-xs ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ borderLeftColor: theme.accent, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}88)`,
                      }}
                    >
                      <DynamicIcon name={item.iconName} className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </h4>
                      <div className={`flex items-center gap-2 text-[10px] font-mono mt-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {item.startTime} - {item.endTime}
                        </span>
                        {item.location && (
                          <span className={`flex items-center gap-0.5 font-sans truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-700 bg-indigo-50'
                  }`}>
                    詳細
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
