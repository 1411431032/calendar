/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Plus,
  X,
  Sparkles,
  Settings,
  GripVertical,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { TimeBlockTemplate } from '../types';
import { COLOR_THEMES, CATEGORIES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface FabFrequentBlocksTrayProps {
  templates: TimeBlockTemplate[];
  activePlacementTemplate: TimeBlockTemplate | null;
  onSelectForPlacement: (tpl: TimeBlockTemplate | null) => void;
  onOpenManagePinned: () => void;
  onOpenCreateTemplate: () => void;
  darkMode?: boolean;
}

export const FabFrequentBlocksTray: React.FC<FabFrequentBlocksTrayProps> = ({
  templates,
  activePlacementTemplate,
  onSelectForPlacement,
  onOpenManagePinned,
  onOpenCreateTemplate,
  darkMode = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Filter templates that the user has chosen to pin to the FAB tray
  const pinnedTemplates = templates.filter((t) => t.isPinnedToFab !== false);

  const handleDragStart = (e: React.DragEvent, tpl: TimeBlockTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = 'copy';
    triggerVibration([25]);
  };

  const handleTogglePlacement = (tpl: TimeBlockTemplate) => {
    if (activePlacementTemplate?.id === tpl.id) {
      onSelectForPlacement(null);
    } else {
      onSelectForPlacement(tpl);
      playChimeSound('drop');
      triggerVibration([30]);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) at Bottom Right */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Placement mode active tooltip if any */}
        {activePlacementTemplate && !isOpen && (
          <div
            onClick={() => onSelectForPlacement(null)}
            className="mb-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer animate-bounce border border-indigo-400"
          >
            <span>點擊課表格子即可排入「{activePlacementTemplate.title}」</span>
            <X className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            triggerVibration([20]);
          }}
          className={`relative w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 border select-none ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30 border-white/30 rotate-45'
              : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/35 border-white/25 hover:scale-105'
          }`}
          title={isOpen ? '收合常用方塊' : '點開常用方塊盤'}
          aria-label="常用方塊快捷盤"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />

          {/* Badge count of pinned templates */}
          {!isOpen && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-sm border border-white">
              {pinnedTemplates.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating Popover / Bottom Tray for Frequent Blocks */}
      {isOpen && (
        <>
          {/* Backdrop on mobile for closing */}
          <div
            className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 max-h-[75vh] z-40 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 transition-colors ${
              darkMode
                ? 'bg-slate-900/98 border-slate-700/80 text-white backdrop-blur-md'
                : 'bg-white/98 border-slate-200 text-slate-900 shadow-indigo-900/10 backdrop-blur-md'
            }`}
          >
            {/* Tray Header */}
            <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
              darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50/70'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    常用事情方塊
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {pinnedTemplates.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">長按拖曳至課表，或點擊後再按格子排入</p>
                </div>
              </div>

              {/* Manage which blocks appear here button (自訂哪些方塊要放在這裡) */}
              <button
                onClick={() => {
                  onOpenManagePinned();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 shadow-2xs'
                }`}
                title="決定哪些方塊要顯示在這裡"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>自訂方塊</span>
              </button>
            </div>

            {/* Blocks List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[50vh]">
              {pinnedTemplates.length === 0 ? (
                <div className="text-center py-8 px-4 text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">尚未在此快捷盤釘選方塊</p>
                  <button
                    onClick={() => {
                      onOpenManagePinned();
                      setIsOpen(false);
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs"
                  >
                    選擇要顯示的方塊
                  </button>
                </div>
              ) : (
                pinnedTemplates.map((tpl) => {
                  const theme = COLOR_THEMES[tpl.colorId] || COLOR_THEMES.indigo;
                  const cat = CATEGORIES.find((c) => c.id === tpl.category) || CATEGORIES[0];
                  const isCurrentPlacement = activePlacementTemplate?.id === tpl.id;

                  return (
                    <div
                      key={tpl.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tpl)}
                      onClick={() => handleTogglePlacement(tpl)}
                      style={{
                        background: darkMode
                          ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}0d)`
                          : `linear-gradient(135deg, ${theme.accent}15, #ffffff)`,
                        borderColor: isCurrentPlacement
                          ? theme.accent
                          : darkMode
                          ? `${theme.accent}45`
                          : `${theme.accent}30`,
                      }}
                      className={`group relative flex items-center justify-between p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                        isCurrentPlacement
                          ? 'ring-2 ring-indigo-500 shadow-md scale-[1.01]'
                          : 'hover:shadow-2xs hover:scale-[1.01]'
                      }`}
                    >
                      {/* Left: Drag grip & Icon & Title */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />

                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}aa)`,
                          }}
                        >
                          <DynamicIcon name={tpl.iconName} className="w-3.5 h-3.5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate leading-tight">
                              {tpl.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {tpl.defaultDuration}分
                            </span>
                            {tpl.defaultLocation && (
                              <span className="truncate max-w-[100px]">
                                • {tpl.defaultLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Place action button */}
                      <div className="flex items-center gap-1 shrink-0 pl-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlacement(tpl);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs ${
                            isCurrentPlacement
                              ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                              : darkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              : 'bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200'
                          }`}
                        >
                          {isCurrentPlacement ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>已選</span>
                            </>
                          ) : (
                            <span>排入</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tray Footer */}
            <div className={`p-2.5 border-t flex items-center justify-between text-xs shrink-0 ${
              darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50/70'
            }`}>
              <button
                onClick={() => {
                  onOpenManagePinned();
                  setIsOpen(false);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>決定哪些方塊放在這裡</span>
              </button>

              <button
                onClick={() => {
                  onOpenCreateTemplate();
                  setIsOpen(false);
                }}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>自訂新方塊</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
