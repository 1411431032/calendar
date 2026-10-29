/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  Plus,
  GripVertical,
  Clock,
  MapPin,
  Bell,
  Edit2,
  Trash2,
  Check,
  Info,
} from 'lucide-react';
import { TimeBlockTemplate, CategoryType } from '../types';
import { COLOR_THEMES, CATEGORIES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface FrequentBlocksDrawerProps {
  templates: TimeBlockTemplate[];
  activePlacementTemplate: TimeBlockTemplate | null;
  darkMode?: boolean;
  onSelectForPlacement: (tpl: TimeBlockTemplate | null) => void;
  onOpenCreateTemplate: () => void;
  onEditTemplate: (tpl: TimeBlockTemplate) => void;
  onDeleteTemplate: (tplId: string) => void;
}

export const FrequentBlocksDrawer: React.FC<FrequentBlocksDrawerProps> = ({
  templates,
  activePlacementTemplate,
  darkMode = false,
  onSelectForPlacement,
  onOpenCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryType | 'all'>('all');

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory === 'all') return true;
    return tpl.category === selectedCategory;
  });

  const handleDragStart = (e: React.DragEvent, tpl: TimeBlockTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = 'copy';
    triggerVibration([30]);
  };

  const handleTogglePlacement = (tpl: TimeBlockTemplate) => {
    if (activePlacementTemplate?.id === tpl.id) {
      onSelectForPlacement(null);
    } else {
      onSelectForPlacement(tpl);
      playChimeSound('drop');
      triggerVibration([50]);
    }
  };

  return (
    <div className={`p-3 sm:p-4 flex flex-col h-full overflow-hidden transition-colors border-t sm:border-t-0 sm:border-l ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Drawer Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            darkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-bold text-sm flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              常用事情方塊
              <span className={`text-[11px] font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>({templates.length})</span>
            </h2>
            <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>拖曳或點選後放置到課表</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateTemplate}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          title="新增自訂方塊"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>自訂</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs shrink-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : darkMode
              ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : darkMode
                ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Helper instruction tooltip */}
      <div className={`rounded-xl p-2.5 my-2 flex items-start gap-2 text-[11px] border ${
        darkMode
          ? 'bg-slate-800/40 border-slate-700/50 text-slate-300'
          : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
      }`}>
        <Info className="w-4 h-4 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">操作提示：</span>
          電腦可直接<span className="text-indigo-600 dark:text-cyan-300 font-semibold">拖曳方塊</span>到時間格；手機可<span className="text-amber-600 dark:text-amber-300 font-semibold">點選排入</span>後直接輕觸課表格子快速排程！
        </div>
      </div>

      {/* List of Templates Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-16 sm:pb-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            此分類尚無常用方塊，可點擊上方「自訂」新增！
          </div>
        ) : (
          filteredTemplates.map((tpl) => {
            const theme = COLOR_THEMES[tpl.colorId] || COLOR_THEMES.indigo;
            const isSelected = activePlacementTemplate?.id === tpl.id;

            return (
              <div
                key={tpl.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tpl)}
                className={`group relative rounded-xl border p-2.5 transition-all select-none cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs ${
                  isSelected
                    ? darkMode
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 border-amber-500/80 bg-slate-800'
                      : 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white border-amber-400 bg-amber-50/50'
                    : darkMode
                    ? 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-600'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Drag grip & icon */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 cursor-grab" />
                    
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}88)`,
                      }}
                    >
                      <DynamicIcon name={tpl.iconName} className="w-4 h-4 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-semibold text-xs truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {tpl.title}
                        </h4>
                      </div>
                      
                      <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {tpl.defaultDuration} 分鐘
                        </span>
                        {tpl.defaultLocation && (
                          <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{tpl.defaultLocation}</span>
                          </span>
                        )}
                        {tpl.reminderEnabled && (
                          <span className="text-amber-500 flex items-center gap-0.5 font-medium" title={`提醒: ${tpl.reminderOffsetMinutes}m 前`}>
                            <Bell className="w-2.5 h-2.5" />
                            {tpl.reminderOffsetMinutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePlacement(tpl)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs'
                          : darkMode
                          ? 'bg-slate-700/80 hover:bg-indigo-600 text-slate-200 hover:text-white'
                          : 'bg-slate-200/80 hover:bg-indigo-600 hover:text-white text-slate-700'
                      }`}
                      title="點選後連點課表格子即可直接排入"
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>放置中</span>
                        </>
                      ) : (
                        <span>排入</span>
                      )}
                    </button>

                    <button
                      onClick={() => onEditTemplate(tpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                      title="編輯此常用方塊"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                      title="刪除方塊"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
