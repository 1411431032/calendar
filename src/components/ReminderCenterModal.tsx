/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  Clock,
  Moon,
  Trash2,
} from 'lucide-react';
import { ScheduleItem, UserSettings, ReminderNotification } from '../types';
import { timeToMinutes } from '../utils/timeUtils';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface ReminderCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleItems: ScheduleItem[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  notifications: ReminderNotification[];
  onClearNotifications: () => void;
}

export const ReminderCenterModal: React.FC<ReminderCenterModalProps> = ({
  isOpen,
  onClose,
  scheduleItems,
  settings,
  onUpdateSettings,
  notifications,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  const isDark = settings.darkMode;

  const [permissionState, setPermissionState] = React.useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          onUpdateSettings({ browserNotificationsEnabled: true });
          new Notification('時光方塊課表', {
            body: '已成功啟用自動提醒！課堂與行程前將為您自動通知。',
            icon: '/favicon.ico',
          });
          playChimeSound('success');
        }
      } catch (err) {
        console.error('Notification permission error:', err);
      }
    }
  };

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayUpcoming = scheduleItems
    .filter((item) => {
      if (item.dayOfWeek !== currentDayOfWeek) return false;
      const startM = timeToMinutes(item.startTime);
      return startM > currentMinutes && item.reminderEnabled;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark
            ? 'border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900'
            : 'border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isDark
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base">自動提醒中心</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>管理課程提醒、通知推播與鈴聲</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Permission Card */}
          <div className={`border rounded-2xl p-3.5 space-y-2 ${
            isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  系統推播通知
                </span>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  狀態：
                  <span
                    className={`font-semibold ml-1 ${
                      permissionState === 'granted'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : permissionState === 'denied'
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {permissionState === 'granted'
                      ? '已開啟推播'
                      : permissionState === 'denied'
                      ? '已拒絕（需在瀏覽器設定中解鎖）'
                      : '尚未授權'}
                  </span>
                </p>
              </div>

              {permissionState !== 'granted' && (
                <button
                  onClick={requestBrowserPermission}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition active:scale-95"
                >
                  授權推播
                </button>
              )}
            </div>
          </div>

          {/* Quick Sound & Vibration Toggles */}
          <div className="grid grid-cols-2 gap-2">
            {/* Sound Toggle */}
            <div className={`border rounded-2xl p-3 flex items-center justify-between ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-semibold">通知鈴聲</span>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.soundEnabled;
                  onUpdateSettings({ soundEnabled: nextVal });
                  if (nextVal) playChimeSound('reminder');
                }}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Vibration Toggle */}
            <div className={`border rounded-2xl p-3 flex items-center justify-between ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold">手機震動</span>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.vibrationEnabled;
                  onUpdateSettings({ vibrationEnabled: nextVal });
                  if (nextVal) triggerVibration([80, 50, 80]);
                }}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.vibrationEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.vibrationEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Sound Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => playChimeSound('reminder')}
              className={`flex-1 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>試聽優雅和弦鈴聲</span>
            </button>
            <button
              onClick={() => triggerVibration([100, 50, 100])}
              className={`px-3 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <span>測試震動</span>
            </button>
          </div>

          {/* Do Not Disturb Toggle */}
          <div className={`border rounded-2xl p-3 flex items-center justify-between ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="text-xs font-semibold">勿擾模式 (DND)</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>暫停所有聲音與彈窗干擾</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ dndMode: !settings.dndMode })}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                settings.dndMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.dndMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Upcoming Reminders Today */}
          <div>
            <h4 className="font-bold text-xs mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              今日後續待提醒日程 ({todayUpcoming.length})
            </h4>

            {todayUpcoming.length === 0 ? (
              <div className={`text-center py-5 rounded-2xl border text-xs ${
                isDark ? 'bg-slate-800/30 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                🎉 今天沒有其他待提醒行程，好好放鬆或專注學習吧！
              </div>
            ) : (
              <div className="space-y-2">
                {todayUpcoming.map((item) => {
                  const startM = timeToMinutes(item.startTime);
                  const minsRemaining = startM - currentMinutes;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 shadow-2xs ${
                        isDark ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs truncate">
                          {item.title}
                        </div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.startTime} • 提早 {item.reminderOffsetMinutes} 分提醒
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 dark:text-cyan-300 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-cyan-800/50 shrink-0">
                        還有 {minsRemaining} 分鐘
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Triggered Notifications History */}
          {notifications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  提醒紀錄歷史 ({notifications.length})
                </h4>
                <button
                  onClick={onClearNotifications}
                  className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除全部</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-lg border p-2 flex items-center justify-between text-xs ${
                      isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{notif.title}</span>
                      <span className={`text-[10px] ml-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {notif.timeString}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      已提醒
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
