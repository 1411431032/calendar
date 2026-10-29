/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Calendar,
  Smartphone,
  Eye,
  FileText,
  Moon,
  Sun,
} from 'lucide-react';
import { UserSettings, ScheduleItem, TimeBlockTemplate } from '../types';
import {
  exportToICS,
  triggerFileDownload,
} from '../utils/storage';
import { playChimeSound } from '../utils/sound';

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  scheduleItems: ScheduleItem[];
  onResetSchedule: () => void;
  onImportData: (items: ScheduleItem[], templates?: TimeBlockTemplate[]) => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  scheduleItems,
  onResetSchedule,
  onImportData,
}) => {
  if (!isOpen) return null;

  const isDark = settings.darkMode;
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleExportICS = () => {
    const icsContent = exportToICS(scheduleItems);
    triggerFileDownload(icsContent, '時光方塊課表.ics', 'text/calendar;charset=utf-8');
    playChimeSound('success');
  };

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      scheduleItems,
    };
    triggerFileDownload(
      JSON.stringify(data, null, 2),
      '時光方塊_備份.json',
      'application/json'
    );
    playChimeSound('success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.scheduleItems)) {
          onImportData(parsed.scheduleItems, parsed.templates);
          playChimeSound('success');
          alert('成功匯入備份排程！');
          onClose();
        } else {
          alert('檔案格式不相符');
        }
      } catch (err) {
        alert('解析檔案失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <Settings className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-base">課表與行事曆設定</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>視圖顯示、色彩外觀與資料匯出</p>
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
          {/* Display Preferences */}
          <div className={`border rounded-2xl p-3.5 space-y-3 ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              顯示與外觀設定
            </h4>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  深色模式 (Dark Theme)
                </span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>關閉後使用清爽的亮明白色背景</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show weekend */}
            <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div>
                <span className="text-xs font-semibold">顯示週末（週六、週日）</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>開啟後週課表涵蓋 7 天日程</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ showWeekend: !settings.showWeekend })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.showWeekend ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.showWeekend ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Use period numbers */}
            <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div>
                <span className="text-xs font-semibold">顯示大學節次標籤</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>顯示「第1節、第2節、午休...」或純時間數字</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ usePeriodNumbers: !settings.usePeriodNumbers })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.usePeriodNumbers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.usePeriodNumbers ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Phone Frame Mode toggle */}
            <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div>
                <span className="text-xs font-semibold">手機外框模擬視圖 (手機體驗)</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>在電腦螢幕上模擬智慧型手機外框尺寸</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ phoneFrameMode: !settings.phoneFrameMode })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.phoneFrameMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.phoneFrameMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Export & Sync */}
          <div className={`border rounded-2xl p-3.5 space-y-3 ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-xs flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              日曆匯出與同步
            </h4>

            <div className="space-y-2">
              <button
                onClick={handleExportICS}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>匯出為 .ics 檔案（可同步至 Google / Apple 日曆）</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>下載 JSON 備份</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>匯入 JSON 備份</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Preset Reset */}
          <div className={`border rounded-2xl p-3.5 flex items-center justify-between ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="text-xs font-semibold">重設為大學經典課表範本</span>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>還原預設的微積分、演算法、自習與打工行程</p>
            </div>
            <button
              onClick={() => {
                if (confirm('確定要還原為預設課表嗎？當前的自訂修改將被覆蓋。')) {
                  onResetSchedule();
                  playChimeSound('success');
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-rose-300 dark:border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              重設範本
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
