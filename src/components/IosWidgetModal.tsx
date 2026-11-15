/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Smartphone,
  Calendar,
  Bell,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { exportToICS, triggerFileDownload } from '../utils/storage';
import { playChimeSound } from '../utils/sound';

interface IosWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleItems: ScheduleItem[];
  darkMode?: boolean;
}

export const IosWidgetModal: React.FC<IosWidgetModalProps> = ({
  isOpen,
  onClose,
  scheduleItems,
  darkMode = false,
}) => {
  if (!isOpen) return null;

  const [downloaded, setDownloaded] = React.useState(false);

  const handleExportICS = () => {
    const icsContent = exportToICS(scheduleItems);
    triggerFileDownload(icsContent, '時光方塊課表.ics', 'text/calendar;charset=utf-8');
    playChimeSound('success');
    setDownloaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`border rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white/90'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                iOS 今日概覽小工具設定
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                讓課表完整出現在 iPhone 今日概覽與鎖定畫面
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
            }`}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* iOS System Note */}
          <div
            className={`p-3.5 rounded-2xl border flex gap-3 ${
              darkMode ? 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200' : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-bold block">💡 為什麼需要透過「Apple 行事曆」小工具？</span>
              <p className="opacity-90">
                Apple iOS 系統限制網頁（PWA）無法直接注入原生的 WidgetKit 小工具，且在螢幕鎖定時會凍結網頁計時器。
              </p>
              <p className="opacity-90">
                最完美的官方解法是：**一鍵將課表匯入 iPhone 內建「行事曆」**，再將「行事曆」加入今日概覽！
                這樣不僅能**在今日概覽完整顯示整週排程**，還能獲得**100% 準時的系統級鎖定響鈴提醒**！
              </p>
            </div>
          </div>

          {/* Action Step 1: One-Click Calendar Export */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-mono">
                  1
                </span>
                一鍵加入 iPhone 內建行事曆
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                含課前10分鐘響鈴
              </span>
            </div>

            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              已為您打包所有最新課程、上課時間、教室代碼（2402, 6504, 3710, 1403A 等）並設定每週重複排程。
            </p>

            <button
              onClick={handleExportICS}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <Download className="w-4 h-4" />
              <span>點此下載課表並加入「行事曆」</span>
            </button>

            {downloaded && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>檔案已送出！iPhone 會跳出「是否加入行事曆？」，請點選「全部加入」。</span>
              </div>
            )}
          </div>

          {/* Step 2: Add to Today View (今日概覽) */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-mono">
                2
              </span>
              在 iPhone 上將小工具放到「今日概覽」
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  A
                </div>
                <p>
                  回到 iPhone 主畫面，**往最左側滑動**進入「**今日概覽**」頁面。
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  B
                </div>
                <p>
                  長按背景空白處，直到圖示開始晃動，點選左上角的 **「＋」（加入小工具）** 按鈕。
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  C
                </div>
                <p>
                  在搜尋欄輸入或找到 **「行事曆 (Calendar)」**，滑動選擇 **「待辦行程」** 或 **「整週清單」** 樣式。
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  D
                </div>
                <p>
                  點擊 **「加入小工具」** ➔ 完成！小工具就會在今日概覽與鎖定畫面中完整呈現整週課表！
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Notification Guarantee */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              darkMode ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Bell className="w-5 h-5 shrink-0 text-amber-500" />
            <div className="text-xs">
              <span className="font-bold block">🔔 解決通知沒跳出來的關鍵</span>
              <p className="opacity-90 mt-0.5">
                透過上述方式加入後，每堂課開始前 10 分鐘，iPhone 系統會自動在鎖定畫面跳出通知並響鈴，解決了 Safari 網頁在背景被休眠而無法通知的問題！
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex justify-end shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white/90'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 shadow-xs"
          >
            知道了，完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
