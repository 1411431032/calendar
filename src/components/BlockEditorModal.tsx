/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Tag,
  Palette,
  Bell,
  Trash2,
  Save,
  Smile,
  User,
  Calendar,
} from 'lucide-react';
import {
  ScheduleItem,
  TimeBlockTemplate,
  CategoryType,
} from '../types';
import { CATEGORIES, COLOR_THEMES } from '../utils/storage';
import { AVAILABLE_ICONS, DynamicIcon } from '../utils/iconMap';
import { DAY_NAMES, calculateEndTime, minutesToTime, timeToMinutes } from '../utils/timeUtils';
import { playChimeSound } from '../utils/sound';

interface BlockEditorModalProps {
  mode: 'template' | 'scheduleItem';
  initialTemplate?: TimeBlockTemplate | null;
  initialItem?: ScheduleItem | null;
  defaultDayOfWeek?: number;
  defaultStartTime?: string;
  defaultDate?: string;
  darkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate?: (tpl: TimeBlockTemplate) => void;
  onSaveItem?: (item: ScheduleItem) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const BlockEditorModal: React.FC<BlockEditorModalProps> = ({
  mode,
  initialTemplate,
  initialItem,
  defaultDayOfWeek = 1,
  defaultStartTime = '09:10',
  defaultDate,
  darkMode = false,
  isOpen,
  onClose,
  onSaveTemplate,
  onSaveItem,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = React.useState(
    mode === 'template'
      ? initialTemplate?.title || ''
      : initialItem?.title || ''
  );
  const [category, setCategory] = React.useState<CategoryType>(
    (mode === 'template' ? initialTemplate?.category : initialItem?.category) || 'course'
  );
  const [colorId, setColorId] = React.useState(
    (mode === 'template' ? initialTemplate?.colorId : initialItem?.colorId) || 'indigo'
  );
  const [iconName, setIconName] = React.useState(
    (mode === 'template' ? initialTemplate?.iconName : initialItem?.iconName) || 'BookOpen'
  );
  const [durationMinutes, setDurationMinutes] = React.useState<number>(
    mode === 'template'
      ? initialTemplate?.defaultDuration || 50
      : initialItem?.durationMinutes || 110
  );
  const [location, setLocation] = React.useState(
    (mode === 'template' ? initialTemplate?.defaultLocation : initialItem?.location) || ''
  );
  const [instructor, setInstructor] = React.useState(
    mode === 'scheduleItem' ? initialItem?.instructor || '' : ''
  );
  const [notes, setNotes] = React.useState(
    (mode === 'template' ? initialTemplate?.defaultNotes : initialItem?.notes) || ''
  );
  const [dayOfWeek, setDayOfWeek] = React.useState<number>(
    mode === 'scheduleItem' ? initialItem?.dayOfWeek || defaultDayOfWeek : 1
  );
  const [startTime, setStartTime] = React.useState<string>(
    mode === 'scheduleItem' ? initialItem?.startTime || defaultStartTime : '09:00'
  );
  const [endTime, setEndTime] = React.useState<string>(
    mode === 'scheduleItem'
      ? initialItem?.endTime || calculateEndTime(defaultStartTime, 110)
      : '10:50'
  );
  const [reminderEnabled, setReminderEnabled] = React.useState<boolean>(
    (mode === 'template' ? initialTemplate?.reminderEnabled : initialItem?.reminderEnabled) ?? true
  );
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = React.useState<number>(
    (mode === 'template' ? initialTemplate?.reminderOffsetMinutes : initialItem?.reminderOffsetMinutes) ?? 10
  );
  const [isRecurringWeekly, setIsRecurringWeekly] = React.useState<boolean>(
    mode === 'scheduleItem' ? initialItem?.isRecurringWeekly ?? true : true
  );
  const [specificDate, setSpecificDate] = React.useState<string>(
    mode === 'scheduleItem' ? initialItem?.specificDate || defaultDate || '' : ''
  );

  const [showIconPicker, setShowIconPicker] = React.useState(false);

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEndTime(calculateEndTime(newStart, durationMinutes));
  };

  const handleDurationChange = (newDur: number) => {
    setDurationMinutes(newDur);
    if (mode === 'scheduleItem') {
      setEndTime(calculateEndTime(startTime, newDur));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (mode === 'template' && onSaveTemplate) {
      const templateData: TimeBlockTemplate = {
        id: initialTemplate?.id || `tpl-${Date.now()}`,
        title: title.trim(),
        category,
        colorId,
        iconName,
        defaultDuration: Number(durationMinutes),
        defaultLocation: location.trim() || undefined,
        defaultNotes: notes.trim() || undefined,
        reminderEnabled,
        reminderOffsetMinutes: Number(reminderOffsetMinutes),
      };
      onSaveTemplate(templateData);
      playChimeSound('success');
    } else if (mode === 'scheduleItem' && onSaveItem) {
      const computedDuration = timeToMinutes(endTime) - timeToMinutes(startTime);
      const itemData: ScheduleItem = {
        id: initialItem?.id || `sch-${Date.now()}`,
        templateId: initialItem?.templateId,
        title: title.trim(),
        category,
        colorId,
        iconName,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        durationMinutes: computedDuration > 0 ? computedDuration : durationMinutes,
        location: location.trim() || undefined,
        instructor: instructor.trim() || undefined,
        notes: notes.trim() || undefined,
        isRecurringWeekly,
        specificDate: isRecurringWeekly ? undefined : (specificDate || undefined),
        reminderEnabled,
        reminderOffsetMinutes: Number(reminderOffsetMinutes),
        isCompleted: initialItem?.isCompleted || false,
      };
      onSaveItem(itemData);
      playChimeSound('success');
    }
    onClose();
  };

  const activeTheme = COLOR_THEMES[colorId] || COLOR_THEMES.indigo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header with theme gradient banner */}
        <div
          className="p-4 border-b flex items-center justify-between text-white"
          style={{
            background: darkMode
              ? `linear-gradient(135deg, ${activeTheme.accent}44, #0f172a)`
              : `linear-gradient(135deg, ${activeTheme.accent}ee, ${activeTheme.accent}bb)`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md relative hover:scale-105 transition bg-white/20 border border-white/30"
              title="點選切換圖示"
            >
              <DynamicIcon name={iconName} className="w-5 h-5 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 text-[8px] flex items-center justify-center text-white border border-slate-700">
                ✎
              </span>
            </button>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'template'
                  ? initialTemplate
                    ? '編輯常用方塊範本'
                    : '新增自訂常用方塊'
                  : initialItem
                  ? '編輯課表行程'
                  : '排入新行程'}
              </h3>
              <p className="text-xs text-white/80">設定標題、類別色彩與自動提醒</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Icon Picker Popover */}
          {showIconPicker && (
            <div className={`border rounded-2xl p-3 ${
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`text-xs font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Smile className="w-3.5 h-3.5 text-indigo-500" />
                選擇圖示：
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1">
                {AVAILABLE_ICONS.map((iName) => (
                  <button
                    key={iName}
                    type="button"
                    onClick={() => {
                      setIconName(iName);
                      setShowIconPicker(false);
                    }}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      iconName === iName
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <DynamicIcon name={iName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              事情 / 課程名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：微積分、資料結構、晨跑重訓、圖書館自習..."
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Category selection */}
          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              所屬類別
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    category === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400'
                      : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              視覺主題色調
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(COLOR_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorId(theme.id)}
                  className={`w-7 h-7 rounded-full transition flex items-center justify-center ring-offset-2 ${
                    darkMode ? 'ring-offset-slate-900' : 'ring-offset-white'
                  } ${
                    colorId === theme.id ? 'ring-2 ring-indigo-600 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: theme.accent }}
                  title={theme.name}
                >
                  {colorId === theme.id && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule specifics if mode === 'scheduleItem' */}
          {mode === 'scheduleItem' && (
            <div className={`border rounded-2xl p-3 space-y-3 ${
              darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Day of week */}
              <div>
                <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                  每週星期幾
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDayOfWeek(d)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                        dayOfWeek === d
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : darkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {DAY_NAMES[d].short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>開始時間</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>結束時間</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full border rounded-xl px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              時長預設（分鐘）
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[30, 50, 75, 90, 110, 120, 180].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDurationChange(dur)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                    durationMinutes === dur
                      ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                      : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dur}分
                </button>
              ))}
              <input
                type="number"
                min={10}
                max={480}
                value={durationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className={`w-20 border rounded-xl px-2 py-1 font-mono text-xs ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Location & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                地點 / 教室
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例：工學院 302、健身房、總圖..."
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {mode === 'scheduleItem' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  授課教授 / 指導者
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="例：張教授、教練..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Auto Reminder settings */}
          <div className={`border rounded-2xl p-3 space-y-2 ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <div>
                  <span className={`font-semibold text-xs ${darkMode ? 'text-white' : 'text-slate-900'}`}>自動到時提醒</span>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>在課程/行程開始前自動發送通知與音效鈴聲</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className={`pt-2 border-t flex items-center gap-2 flex-wrap text-xs ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>提早多久通知：</span>
                {[0, 5, 10, 15, 30, 60].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setReminderOffsetMinutes(offset)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      reminderOffsetMinutes === offset
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : darkMode
                        ? 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {offset === 0 ? '準時' : `${offset}分鐘前`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              備忘筆記 / 待辦事項
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="作業繳交、攜帶課本、考試複習範圍..."
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className={`pt-3 border-t flex items-center justify-between gap-2 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            {mode === 'scheduleItem' && initialItem && onDeleteItem ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(initialItem.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>刪除行程</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>儲存設定</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
