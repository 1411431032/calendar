/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  Code,
  Bell,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { exportToICS, triggerFileDownload } from '../utils/storage';
import { generateWidgetImage } from '../utils/widgetImageGenerator';
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

  const [activeTab, setActiveTab] = useState<'image' | 'scriptable' | 'calendar'>('image');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Generate preview image on open or theme change
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);
    generateWidgetImage(scheduleItems, {
      darkMode,
      startHour: 8,
      endHour: 22,
      showWeekend: false,
    })
      .then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate widget image:', err);
        setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [scheduleItems, darkMode]);

  const handleDownloadImage = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `時光方塊課表_今日概覽_${darkMode ? '深色' : '淺色'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    playChimeSound('success');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const handleExportICS = () => {
    const icsContent = exportToICS(scheduleItems);
    triggerFileDownload(icsContent, '時光方塊課表.ics', 'text/calendar;charset=utf-8');
    playChimeSound('success');
  };

  const scriptableCode = `// 時光方塊課表 iOS 今日概覽小工具腳本
const APP_URL = "https://1411431032.github.io/calendar/";
const widget = new ListWidget();
widget.backgroundColor = new Color("#090d16");

const title = widget.addText("時光方塊課表");
title.textColor = new Color("#818cf8");
title.font = Font.boldSystemFont(16);

widget.addSpacer(8);
const desc = widget.addText("點此開啟整週課表與行事曆 (8:00 - 22:00)");
desc.textColor = new Color("#94a3b8");
desc.font = Font.systemFont(12);

widget.url = APP_URL;
Script.setWidget(widget);
Script.complete();
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptableCode);
    setCopiedCode(true);
    playChimeSound('success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className={`border rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white/90'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5 truncate">
                加入 iPhone「今日概覽」小工具
              </h3>
              <p className={`text-[11px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                100% 呈現時光方塊彩色課表版面，告別原生單調文字
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition shrink-0 ${
              darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
            }`}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b px-3 pt-2 gap-1 shrink-0 ${
          darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold text-xs transition ${
              activeTab === 'image'
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>🌟 原版課表圖卡（最美推薦）</span>
          </button>

          <button
            onClick={() => setActiveTab('scriptable')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold text-xs transition ${
              activeTab === 'scriptable'
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Scriptable 小工具</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold text-xs transition ${
              activeTab === 'calendar'
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>鎖定響鈴</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {activeTab === 'image' && (
            <>
              {/* Feature highlight */}
              <div
                className={`p-3 rounded-2xl border flex gap-2.5 ${
                  darkMode
                    ? 'bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border-indigo-800/50 text-indigo-200'
                    : 'bg-gradient-to-r from-indigo-50 via-white to-white border-indigo-200 text-indigo-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <span className="font-bold block text-indigo-400 dark:text-cyan-300">
                    專為 iPhone 今日概覽量身打造的原版視覺課表！
                  </span>
                  <p className="opacity-90">
                    一鍵匯出超高清課表圖卡（週一至週五 8:00-22:00 全時段、彩色方塊、中科大教室編號 2402, 6504, 3710... 完整標示），加入 iPhone「照片」小工具，滑開今日概覽就是 100% 時光方塊原生美學！
                  </p>
                </div>
              </div>

              {/* Live Preview of Widget Image */}
              <div
                className={`rounded-2xl border p-2 flex flex-col items-center justify-center relative ${
                  darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {isGenerating ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                    正在即時繪製專用課表圖卡...
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="iPhone 今日概覽課表預覽"
                    className="max-h-56 w-auto rounded-xl shadow-lg border border-white/10 object-contain"
                  />
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadImage}
                disabled={isGenerating || !previewUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>一鍵下載「今日概覽」高清課表圖卡 (PNG)</span>
              </button>

              {downloadSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>已儲存至手機！請依照下方 3 步驟放到 iPhone 今日概覽。</span>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 block">
                  📱 iPhone 3 步驟放入今日概覽教學：
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                      1
                    </span>
                    <p>
                      點擊上方按鈕下載課表圖片（若跳出選單請點「**儲存影像**」至手機相簿）。
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                      2
                    </span>
                    <p>
                      在 iPhone 桌面往最左側滑動進入「**今日概覽**」➔ 滑到最下方點「**編輯**」➔ 點左上角「**＋（加入小工具）**」。
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                      3
                    </span>
                    <p>
                      搜尋選擇「**照片**」小工具（選擇中型或大型）➔ 長按小工具點「編輯小工具」➔ 指定這張「時光方塊課表」圖片，即刻完美呈現！
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'scriptable' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-bold block text-indigo-500 mb-1">
                  💡 什麼是 Scriptable？
                </span>
                <p>
                  Scriptable 是 iOS App Store 官方免費的小工具神器，允許在 iPhone 今日概覽上直接呈現自訂動態小工具，並支援點擊小工具一秒直達時光方塊課表！
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Scriptable 小工具腳本代碼：</span>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? '已複製代碼！' : '一鍵複製代碼'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[10px] overflow-x-auto max-h-36 border border-slate-800">
                  {scriptableCode}
                </pre>
              </div>

              <div
                className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-bold block">使用步驟：</span>
                <ol className="list-decimal list-inside space-y-1 opacity-90">
                  <li>在 App Store 下載免費的「**Scriptable**」App。</li>
                  <li>打開 Scriptable 點右上角「＋」，貼上代碼並儲存。</li>
                  <li>在 iPhone「今日概覽」點「＋」搜尋「Scriptable」，加入小工具即可！</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-500">
                    <Bell className="w-4 h-4" />
                    Apple 原生行事曆（系統級鎖定響鈴）
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    含課前 10 分鐘響鈴
                  </span>
                </div>
                <p className="opacity-80">
                  iPhone 螢幕休眠時會凍結網頁。若您需要手機黑屏鎖定時有系統級鬧鈴響鈴提醒，可將排程匯入 iPhone 內建行事曆：
                </p>
                <button
                  onClick={handleExportICS}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>下載課表並同步至 Apple 行事曆</span>
                </button>
              </div>
            </div>
          )}
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
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
