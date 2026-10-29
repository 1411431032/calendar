/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Layers,
  X,
  GripHorizontal,
} from 'lucide-react';
import { TimeBlockTemplate } from '../types';
import { COLOR_THEMES, CATEGORIES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';
import { minutesToTime, snapMinutes, DAY_NAMES } from '../utils/timeUtils';

interface FrequentBlocksBannerProps {
  templates: TimeBlockTemplate[];
  activePlacementTemplate: TimeBlockTemplate | null;
  onSelectForPlacement: (tpl: TimeBlockTemplate | null) => void;
  onDropTemplateOnSlot: (tpl: TimeBlockTemplate, dayOfWeek: number, startTime: string) => void;
  onOpenManagePinned: () => void;
  onOpenCreateTemplate: () => void;
  darkMode?: boolean;
}

export const FrequentBlocksBanner: React.FC<FrequentBlocksBannerProps> = ({
  templates,
  activePlacementTemplate,
  onSelectForPlacement,
  onDropTemplateOnSlot,
  onOpenManagePinned,
  onOpenCreateTemplate,
  darkMode = false,
}) => {
  // Whether the horizontal banner dock is open (default true so user sees both timetable and banner)
  const [isOpen, setIsOpen] = useState(true);

  // Filter templates that the user has chosen to pin to the frequent tray
  const pinnedTemplates = templates.filter((t) => t.isPinnedToFab !== false);

  // Dragging state for mobile touch long-press & drag-to-timetable
  const [dragState, setDragState] = useState<{
    template: TimeBlockTemplate;
    x: number;
    y: number;
    hoverDayOfWeek: number | null;
    hoverDayName: string | null;
    hoverStartTime: string | null;
  } | null>(null);

  const [pressingId, setPressingId] = useState<string | null>(null);

  // References for touch tracking
  const touchStartRef = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    template: TimeBlockTemplate;
    timer: ReturnType<typeof setTimeout> | null;
    hasMoved: boolean;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (touchStartRef.current?.timer) {
        clearTimeout(touchStartRef.current.timer);
      }
    };
  }, []);

  // Calculate target day column and snapped time from touch pointer coordinates
  const calculateDropTarget = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;

    const colEl = el.closest('[data-timetable-column]') as HTMLElement | null;
    if (!colEl) return null;

    const dayOfWeek = Number(colEl.dataset.timetableColumn);
    const dayName = colEl.dataset.timetableColname || `週${dayOfWeek}`;
    const rect = colEl.getBoundingClientRect();
    const relativeY = clientY - rect.top;

    // 62px per hour, starting from 8:00
    const startHour = 8;
    const rawMinutes = startHour * 60 + (relativeY / 62) * 60;
    const snappedMinutes = snapMinutes(rawMinutes, 10);
    // Clamp to valid range (8:00 to 21:30)
    const clampedMinutes = Math.max(startHour * 60, Math.min(21 * 60 + 30, snappedMinutes));
    const timeStr = minutesToTime(clampedMinutes);

    return {
      dayOfWeek,
      dayName,
      timeStr,
    };
  };

  // Pointer Down on a card in the horizontal ribbon
  const handleCardPointerDown = (e: React.PointerEvent, tpl: TimeBlockTemplate) => {
    // Only primary pointer
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const pointerId = e.pointerId;

    setPressingId(tpl.id);

    // Set 340ms long-press hold timer
    const timer = setTimeout(() => {
      // Long-press activated! Enter drag mode
      triggerVibration([40, 50]);
      playChimeSound('drop');
      setPressingId(null);

      const target = calculateDropTarget(clientX, clientY);

      setDragState({
        template: tpl,
        x: clientX,
        y: clientY,
        hoverDayOfWeek: target?.dayOfWeek ?? null,
        hoverDayName: target?.dayName ?? null,
        hoverStartTime: target?.timeStr ?? null,
      });

      // Bind global move & up listeners
      const handleWindowPointerMove = (moveEv: PointerEvent) => {
        const dropTarget = calculateDropTarget(moveEv.clientX, moveEv.clientY);
        setDragState((prev) =>
          prev
            ? {
                ...prev,
                x: moveEv.clientX,
                y: moveEv.clientY,
                hoverDayOfWeek: dropTarget?.dayOfWeek ?? null,
                hoverDayName: dropTarget?.dayName ?? null,
                hoverStartTime: dropTarget?.timeStr ?? null,
              }
            : null
        );
      };

      const handleWindowPointerUp = (upEv: PointerEvent) => {
        window.removeEventListener('pointermove', handleWindowPointerMove);
        window.removeEventListener('pointerup', handleWindowPointerUp);
        window.removeEventListener('pointercancel', handleWindowPointerUp);

        const dropTarget = calculateDropTarget(upEv.clientX, upEv.clientY);
        if (dropTarget) {
          onDropTemplateOnSlot(tpl, dropTarget.dayOfWeek, dropTarget.timeStr);
          triggerVibration([50]);
          playChimeSound('drop');
        }

        setDragState(null);
        touchStartRef.current = null;
      };

      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerUp);
      window.addEventListener('pointercancel', handleWindowPointerUp);
    }, 340);

    touchStartRef.current = {
      startX: clientX,
      startY: clientY,
      pointerId,
      template: tpl,
      timer,
      hasMoved: false,
    };
  };

  const handleCardPointerMove = (e: React.PointerEvent) => {
    if (!touchStartRef.current || dragState) return;

    // Check if user has moved horizontally (scrolling through the horizontal ribbon)
    const dx = e.clientX - touchStartRef.current.startX;
    const dy = e.clientY - touchStartRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      // Finger moved: cancel long-press to allow smooth horizontal scrolling of the ribbon!
      if (touchStartRef.current.timer) {
        clearTimeout(touchStartRef.current.timer);
        touchStartRef.current.timer = null;
      }
      touchStartRef.current.hasMoved = true;
      setPressingId(null);
    }
  };

  const handleCardPointerUp = (e: React.PointerEvent, tpl: TimeBlockTemplate) => {
    if (touchStartRef.current) {
      if (touchStartRef.current.timer) {
        clearTimeout(touchStartRef.current.timer);
        touchStartRef.current.timer = null;
      }

      // If finger did not move and was released before long-press timer fired: treat as quick tap to toggle placement mode!
      if (!touchStartRef.current.hasMoved && !dragState) {
        if (activePlacementTemplate?.id === tpl.id) {
          onSelectForPlacement(null);
        } else {
          onSelectForPlacement(tpl);
          playChimeSound('drop');
          triggerVibration([25]);
        }
      }
    }

    setPressingId(null);
    touchStartRef.current = null;
  };

  const handleCardPointerCancel = () => {
    if (touchStartRef.current?.timer) {
      clearTimeout(touchStartRef.current.timer);
    }
    setPressingId(null);
    touchStartRef.current = null;
  };

  // HTML5 Drag for desktop mouse
  const handleDragStart = (e: React.DragEvent, tpl: TimeBlockTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = 'copy';
    triggerVibration([25]);
  };

  return (
    <>
      {/* Collapsed Shortcut Button (when banner is minimized) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 pointer-events-auto">
          {activePlacementTemplate && (
            <div
              onClick={() => onSelectForPlacement(null)}
              className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer animate-pulse border border-indigo-400"
            >
              <span>點課表格子排入「{activePlacementTemplate.title}」</span>
              <X className="w-3.5 h-3.5" />
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(true);
              triggerVibration([20]);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/30 border border-white/20 active:scale-95 transition-all text-xs font-bold"
            title="點開常用方塊橫幅"
            aria-label="展開常用方塊橫幅"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>常用方塊</span>
            <span className="min-w-5 h-5 px-1 rounded-full bg-white/25 text-white text-[10px] font-mono flex items-center justify-center font-bold">
              {pinnedTemplates.length}
            </span>
          </button>
        </div>
      )}

      {/* Horizontal Banner Dock at Bottom: Simultaneous with Timetable, NO BACKDROP! */}
      {isOpen && (
        <aside
          aria-label="常用方塊橫幅快捷列"
          className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-200 border-t shadow-2xl ${
            darkMode
              ? 'bg-slate-900/95 border-slate-700/80 text-white backdrop-blur-md'
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md shadow-indigo-950/15'
          }`}
        >
          {/* Active Placement Mode Helper Strip if user tapped a block */}
          {activePlacementTemplate && (
            <div className="bg-indigo-600 text-white text-xs px-3 py-1 flex items-center justify-between font-medium">
              <span className="truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                已選取「{activePlacementTemplate.title}」，請點擊課表上的時間格子即可快速排入
              </span>
              <button
                onClick={() => onSelectForPlacement(null)}
                className="text-indigo-200 hover:text-white px-1.5 py-0.5 text-[11px] font-bold"
              >
                取消
              </button>
            </div>
          )}

          {/* Banner Header: Title, block count, manage pinned blocks, minimize */}
          <div
            className={`px-3 py-1.5 border-b flex items-center justify-between gap-2 shrink-0 ${
              darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-xs shrink-0">常用事情方塊</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  {pinnedTemplates.length}
                </span>
                <span className="text-[10px] text-slate-400 truncate hidden xs:inline">
                  長按方塊拖曳至課表，左右滑動瀏覽
                </span>
              </div>
            </div>

            {/* Actions: Customize blocks & Add & Minimize */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Button: Decide which blocks appear here */}
              <button
                type="button"
                onClick={onOpenManagePinned}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 shadow-2xs'
                }`}
                title="決定哪些方塊要顯示在這裡"
              >
                <Settings className="w-3 h-3" />
                <span>自訂方塊</span>
              </button>

              {/* Button: Create new block template */}
              <button
                type="button"
                onClick={onOpenCreateTemplate}
                className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                }`}
                title="建立新方塊"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">新增</span>
              </button>

              {/* Minimize Banner Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerVibration([15]);
                }}
                className={`p-1 rounded-lg transition ${
                  darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="收合橫幅"
                aria-label="收合常用方塊橫幅"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Ribbon Track (左右滑動看有什麼方塊) */}
          <div
            ref={scrollContainerRef}
            className="flex flex-row overflow-x-auto scrollbar-none gap-2 px-3 py-2 items-center touch-pan-x select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {pinnedTemplates.length === 0 ? (
              <div className="flex items-center gap-3 py-2 px-4 text-slate-400 w-full justify-center text-xs">
                <Layers className="w-4 h-4 opacity-50" />
                <span>尚未釘選常用方塊</span>
                <button
                  type="button"
                  onClick={onOpenManagePinned}
                  className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-semibold text-[11px]"
                >
                  選擇要顯示的方塊
                </button>
              </div>
            ) : (
              pinnedTemplates.map((tpl) => {
                const theme = COLOR_THEMES[tpl.colorId] || COLOR_THEMES.indigo;
                const isSelectedPlacement = activePlacementTemplate?.id === tpl.id;
                const isPressingThis = pressingId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tpl)}
                    onPointerDown={(e) => handleCardPointerDown(e, tpl)}
                    onPointerMove={handleCardPointerMove}
                    onPointerUp={(e) => handleCardPointerUp(e, tpl)}
                    onPointerCancel={handleCardPointerCancel}
                    style={{
                      background: darkMode
                        ? `linear-gradient(135deg, ${theme.accent}25, ${theme.accent}0f)`
                        : `linear-gradient(135deg, ${theme.accent}18, #ffffff)`,
                      borderColor: isSelectedPlacement
                        ? theme.accent
                        : isPressingThis
                        ? theme.accent
                        : darkMode
                        ? `${theme.accent}45`
                        : `${theme.accent}30`,
                    }}
                    className={`shrink-0 w-32 sm:w-36 h-16 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing select-none relative group ${
                      isSelectedPlacement
                        ? 'ring-2 ring-indigo-500 shadow-md scale-[1.02]'
                        : isPressingThis
                        ? 'scale-95 ring-2 ring-indigo-400'
                        : 'hover:shadow-xs hover:scale-[1.02]'
                    }`}
                  >
                    {/* Top row: Icon + Title */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}aa)`,
                        }}
                      >
                        <DynamicIcon name={tpl.iconName} className="w-3 h-3 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[11px] truncate block leading-tight">
                          {tpl.title}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Duration + Location + Drag indicator */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        {tpl.defaultDuration}分
                      </span>

                      {tpl.defaultLocation ? (
                        <span className="truncate max-w-[50px] text-[9px] text-slate-400">
                          {tpl.defaultLocation}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 opacity-60">長按拖曳</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Quick add / customize trailing button */}
            <button
              type="button"
              onClick={onOpenManagePinned}
              className={`shrink-0 h-16 px-3 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${
                darkMode
                  ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  : 'border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400'
              }`}
              title="決定哪些方塊放在這裡"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>管理方塊</span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating Dragged Card Ghost following touch pointer over Timetable */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl rounded-xl p-2.5 border-2 flex flex-col gap-1 ring-4 ring-indigo-500/30 scale-105"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y - 35}px`,
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderColor: COLOR_THEMES[dragState.template.colorId]?.accent || '#6366f1',
          }}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <DynamicIcon name={dragState.template.iconName} className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-900 dark:text-white">{dragState.template.title}</span>
            <span className="text-[10px] font-mono text-slate-400">
              ({dragState.template.defaultDuration}分)
            </span>
          </div>

          {dragState.hoverDayOfWeek && dragState.hoverStartTime ? (
            <div className="bg-indigo-600 text-white text-[11px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center justify-between gap-2 shadow-xs">
              <span>{dragState.hoverDayName || `週${dragState.hoverDayOfWeek}`}</span>
              <span>{dragState.hoverStartTime} 放置</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              移動至課表格子放開
            </div>
          )}
        </div>
      )}
    </>
  );
};
