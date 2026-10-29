/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Star,
  Check,
  Plus,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Clock,
  Layers,
} from 'lucide-react';
import { TimeBlockTemplate, CategoryType } from '../types';
import { COLOR_THEMES, CATEGORIES } from '../utils/storage';
import { DynamicIcon } from '../utils/iconMap';
import { playChimeSound, triggerVibration } from '../utils/sound';

interface ManagePinnedBlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TimeBlockTemplate[];
  onUpdateTemplates: (updated: TimeBlockTemplate[]) => void;
  onOpenCreateTemplate: () => void;
  darkMode?: boolean;
}

export const ManagePinnedBlocksModal: React.FC<ManagePinnedBlocksModalProps> = ({
  isOpen,
  onClose,
  templates,
  onUpdateTemplates,
  onOpenCreateTemplate,
  darkMode = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryType | 'all'>('all');

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (searchQuery.trim() && !tpl.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pinnedCount = templates.filter((t) => t.isPinnedToFab !== false).length;

  const handleTogglePin = (tplId: string) => {
    const updated = templates.map((t) => {
      if (t.id === tplId) {
        const nextState = t.isPinnedToFab === false ? true : false;
        return { ...t, isPinnedToFab: nextState };
      }
      return t;
    });
    onUpdateTemplates(updated);
    triggerVibration([30]);
  };

  const handleSelectAll = (pinned: boolean) => {
    const updated = templates.map((t) => ({
      ...t,
      isPinnedToFab: pinned,
    }));
    onUpdateTemplates(updated);
    playChimeSound('drop');
    triggerVibration([40]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Star className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                自訂常用方塊橫幅
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-semibold font-mono">
                  {pinnedCount} / {templates.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                勾選的方塊會出現在課表底部的水平橫幅中，方便左右滑動瀏覽與長按拖曳排課
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className={`p-3 border-b space-y-2 shrink-0 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="搜尋常用方塊名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-hidden"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={onOpenCreateTemplate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增方塊</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px] py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                全部
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-md font-medium transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick bulk action buttons */}
            <div className="flex items-center gap-1 shrink-0 text-xs">
              <button
                onClick={() => handleSelectAll(true)}
                className="px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                全選
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => handleSelectAll(false)}
                className="px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:underline"
              >
                全不選
              </button>
            </div>
          </div>
        </div>

        {/* Templates List with Checkbox & Star */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <Layers className="w-8 h-8 mx-auto stroke-1 opacity-50" />
              <p>沒有符合條件的方塊</p>
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isPinned = tpl.isPinnedToFab !== false;
              const theme = COLOR_THEMES[tpl.colorId] || COLOR_THEMES.indigo;
              const cat = CATEGORIES.find((c) => c.id === tpl.category) || CATEGORIES[0];

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleTogglePin(tpl.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isPinned
                      ? darkMode
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-2xs'
                        : 'bg-indigo-50/40 border-indigo-300 shadow-2xs'
                      : darkMode
                      ? 'bg-slate-800/40 border-slate-800 opacity-60 hover:opacity-100'
                      : 'bg-slate-50/50 border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Left: Checkbox & Preview */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(tpl.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                        isPinned
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}ee, ${theme.accent}aa)`,
                      }}
                    >
                      <DynamicIcon name={tpl.iconName} className="w-4 h-4 text-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate">{tpl.title}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0"
                          style={{
                            backgroundColor: `${theme.accent}20`,
                            color: theme.accent,
                          }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {tpl.defaultDuration} 分鐘
                        </span>
                        {tpl.defaultLocation && (
                          <span className="truncate max-w-[120px]">
                            • {tpl.defaultLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Star status */}
                  <div className="flex items-center gap-1 pl-2 shrink-0">
                    <div
                      className={`p-1.5 rounded-lg transition ${
                        isPinned
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                      title={isPinned ? '已顯示在底部橫幅' : '未顯示'}
                    >
                      <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-500' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex items-center justify-between shrink-0 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            已勾選 <span className="font-bold text-indigo-600 dark:text-indigo-400">{pinnedCount}</span> 個常用方塊
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
