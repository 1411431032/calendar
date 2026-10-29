/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  BarChart3,
  PieChart,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { calculateCategoryStats, timeToMinutes, DAY_NAMES } from '../utils/timeUtils';
import { CATEGORIES, COLOR_THEMES } from '../utils/storage';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleItems: ScheduleItem[];
  darkMode?: boolean;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  scheduleItems,
  darkMode = false,
}) => {
  if (!isOpen) return null;

  const stats = React.useMemo(() => calculateCategoryStats(scheduleItems), [scheduleItems]);

  const dayLoads = React.useMemo(() => {
    const loads: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (const item of scheduleItems) {
      const dur = item.durationMinutes || (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
      loads[item.dayOfWeek] = (loads[item.dayOfWeek] || 0) + dur / 60;
    }
    return loads;
  }, [scheduleItems]);

  const maxDayLoad = Math.max(...Object.values(dayLoads), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode
            ? 'border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900'
            : 'border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              darkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">一週時間分配視覺化</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>洞察學習課業、運動自律與生活平衡</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`border rounded-2xl p-3 text-center ${
              darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>每週總排程</span>
              <div className="text-lg sm:text-xl font-extrabold font-mono mt-0.5">
                {stats.totalHours} <span className={`text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>小時</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-3 text-center ${
              darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>總事情方塊</span>
              <div className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-cyan-400 font-mono mt-0.5">
                {stats.totalItems} <span className={`text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>個</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-3 text-center ${
              darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>專注指數</span>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                <span>94</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Day of Week Workload Bar Chart */}
          <div className={`border rounded-2xl p-3.5 ${
            darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                週一至週日負荷分佈
              </span>
              <span className={`text-[10px] font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>單位：小時</span>
            </h4>

            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-1">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const load = Number((dayLoads[d] || 0).toFixed(1));
                const heightPercent = Math.min(100, Math.round((load / maxDayLoad) * 100));

                return (
                  <div key={d} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span className={`text-[9px] font-mono font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {load > 0 ? `${load}` : '-'}
                    </span>
                    <div className={`w-full rounded-t-lg overflow-hidden h-16 flex items-end ${
                      darkMode ? 'bg-slate-800' : 'bg-slate-200'
                    }`}>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-cyan-500 rounded-t-lg transition-all duration-700 hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                        title={`${DAY_NAMES[d].full}：${load} 小時`}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {DAY_NAMES[d].short.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className={`border rounded-2xl p-3.5 space-y-3 ${
            darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-amber-500" />
              各類別時間佔比分析
            </h4>

            <div className="space-y-2.5">
              {CATEGORIES.map((cat) => {
                const hours = Number((stats.categoryHours[cat.id] || 0).toFixed(1));
                const percent = stats.totalHours > 0 ? Math.round((hours / stats.totalHours) * 100) : 0;
                const theme = COLOR_THEMES[cat.defaultColor] || COLOR_THEMES.indigo;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold">{hours}h</span>
                        <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>({percent}%)</span>
                      </div>
                    </div>

                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: theme.accent,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
