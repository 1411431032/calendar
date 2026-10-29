/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BellRing,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { DynamicIcon } from '../utils/iconMap';
import { COLOR_THEMES } from '../utils/storage';

interface NotificationToastProps {
  item: ScheduleItem | null;
  message: string;
  darkMode?: boolean;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  item,
  message,
  darkMode = false,
  onDismiss,
  onSnooze,
}) => {
  if (!item) return null;

  const theme = COLOR_THEMES[item.colorId] || COLOR_THEMES.indigo;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-in">
      <div className={`border-2 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 ${
        darkMode
          ? 'bg-slate-900/95 border-amber-500/80 shadow-amber-500/20 text-white'
          : 'bg-white/95 border-amber-400 shadow-slate-300 text-slate-900'
      }`}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ring-2 ring-amber-400"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}88)`,
          }}
        >
          <DynamicIcon name={item.iconName} className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mb-0.5">
            <BellRing className="w-3.5 h-3.5 animate-pulse" />
            <span>{message}</span>
          </div>

          <h4 className="font-bold text-sm truncate">{item.title}</h4>

          <div className={`flex items-center gap-3 text-xs font-mono mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <span>{item.startTime} - {item.endTime}</span>
            {item.location && (
              <span className={`flex items-center gap-1 font-sans truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
            )}
          </div>

          {/* Quick buttons */}
          <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              onClick={onDismiss}
              className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>我知道了</span>
            </button>
            <button
              onClick={onSnooze}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition border ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              延後 5 分鐘
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className={`p-1 rounded-lg transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
          aria-label="關閉通知"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
