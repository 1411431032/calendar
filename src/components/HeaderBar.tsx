/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  Clock,
  Bell,
  Grid3X3,
  BarChart3,
  Settings,
  Sparkles,
  Smartphone,
  Maximize2,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTab, UserSettings, TimeBlockTemplate } from '../types';

interface HeaderBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenReminderCenter: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenCreateItem: () => void;
  activePlacementTemplate: TimeBlockTemplate | null;
  onCancelPlacement: () => void;
  unreadRemindersCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  onOpenReminderCenter,
  onOpenSettings,
  onOpenAnalytics,
  onOpenCreateItem,
  activePlacementTemplate,
  onCancelPlacement,
  unreadRemindersCount,
}) => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' });

  const isDark = settings.darkMode;

  return (
    <header
      className={`sticky top-0 z-30 px-3 py-2.5 transition-colors border-b backdrop-blur-md ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      {/* Top row: App Brand & Quick Tools */}
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-1">
                時光方塊
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  課表＋行事曆
                </span>
              </h1>
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-500 shrink-0" />
              <span>{dateString}</span>
              <span className="opacity-50">•</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-cyan-300">{timeString}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Add quick event */}
          <button
            onClick={onOpenCreateItem}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="手動新增行程"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">排程</span>
          </button>

          {/* Theme Toggle (White / Dark) */}
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className={`p-2 rounded-lg transition active:scale-95 border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isDark ? '切換為白色亮色背景' : '切換為暗色夜間模式'}
            aria-label="切換顏色主題"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reminder Center */}
          <button
            onClick={onOpenReminderCenter}
            className={`relative p-2 rounded-lg transition active:scale-95 border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            aria-label="提醒中心"
            title="自動提醒中心"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            {unreadRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadRemindersCount > 9 ? '9+' : unreadRemindersCount}
              </span>
            )}
          </button>

          {/* Analytics Modal */}
          <button
            onClick={onOpenAnalytics}
            className={`p-2 rounded-lg transition active:scale-95 border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            aria-label="統計分析"
            title="時間分配統計"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition active:scale-95 border ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            aria-label="設定與匯出"
            title="設定與匯出"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Mobile frame toggle (desktop only) */}
          <button
            onClick={() => onUpdateSettings({ phoneFrameMode: !settings.phoneFrameMode })}
            className={`hidden md:flex p-2 rounded-lg transition active:scale-95 border ${
              settings.phoneFrameMode
                ? 'bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-400'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title={settings.phoneFrameMode ? '切換為滿版視圖' : '切換為手機模擬外框'}
            aria-label="切換手機模擬外框"
          >
            {settings.phoneFrameMode ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Second row: View Mode Switcher Pills */}
      <div
        className={`flex items-center justify-between gap-2 max-w-7xl mx-auto mt-2 pt-1 border-t ${
          isDark ? 'border-slate-800/60' : 'border-slate-200/80'
        }`}
      >
        <nav
          className={`flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100/80 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>週課表</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'daily'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>日行程</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>月行事曆</span>
          </button>

          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'blocks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>常用方塊</span>
          </button>
        </nav>
      </div>

      {/* Floating alert bar if in active tap-to-place mode */}
      {activePlacementTemplate && (
        <div
          className={`mt-2 rounded-xl px-3 py-2 flex items-center justify-between gap-2 animate-pulse text-xs border ${
            isDark
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="truncate">
              已選取方塊：<strong className={isDark ? 'text-white' : 'text-slate-900'}>{activePlacementTemplate.title}</strong>
              <span className="ml-1 opacity-80">（請點選課表任一時段直接放置）</span>
            </span>
          </div>
          <button
            onClick={onCancelPlacement}
            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0"
          >
            取消放置
          </button>
        </div>
      )}
    </header>
  );
};
