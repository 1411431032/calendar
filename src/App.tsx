/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ActiveTab,
  ScheduleItem,
  TimeBlockTemplate,
  UserSettings,
  ReminderNotification,
} from './types';
import {
  loadSchedule,
  saveSchedule,
  loadTemplates,
  saveTemplates,
  loadSettings,
  saveSettings,
  DEFAULT_SCHEDULE_ITEMS,
  DEFAULT_TEMPLATES,
} from './utils/storage';
import { calculateEndTime, timeToMinutes, DAY_NAMES } from './utils/timeUtils';
import { playChimeSound, triggerVibration } from './utils/sound';

import { MobileFrame } from './components/MobileFrame';
import { HeaderBar } from './components/HeaderBar';
import { CurrentEventBanner } from './components/CurrentEventBanner';
import { ViewTimetable } from './components/ViewTimetable';
import { ViewDaily } from './components/ViewDaily';
import { ViewCalendar } from './components/ViewCalendar';
import { FrequentBlocksDrawer } from './components/FrequentBlocksDrawer';
import { BlockEditorModal } from './components/BlockEditorModal';
import { ReminderCenterModal } from './components/ReminderCenterModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { QuickSettingsModal } from './components/QuickSettingsModal';
import { NotificationToast } from './components/NotificationToast';
import { FrequentBlocksBanner } from './components/FrequentBlocksBanner';
import { ManagePinnedBlocksModal } from './components/ManagePinnedBlocksModal';

export default function App() {
  // Primary States
  const [scheduleItems, setScheduleItems] = React.useState<ScheduleItem[]>(() => loadSchedule());
  const [templates, setTemplates] = React.useState<TimeBlockTemplate[]>(() => loadTemplates());
  const [settings, setSettings] = React.useState<UserSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('timetable');

  // Interactive Placement Mode (Tap-to-Place on mobile & desktop)
  const [activePlacementTemplate, setActivePlacementTemplate] = React.useState<TimeBlockTemplate | null>(null);

  // Modals & Panels
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<'template' | 'scheduleItem'>('template');
  const [editingTemplate, setEditingTemplate] = React.useState<TimeBlockTemplate | null>(null);
  const [editingItem, setEditingItem] = React.useState<ScheduleItem | null>(null);
  const [isManagePinnedOpen, setIsManagePinnedOpen] = React.useState(false);
  const [slotDefaults, setSlotDefaults] = React.useState<{ dayOfWeek: number; startTime: string; dateStr?: string }>({
    dayOfWeek: 1,
    startTime: '09:10',
  });

  const [isReminderCenterOpen, setIsReminderCenterOpen] = React.useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // Active Real-time Alert Toast
  const [activeAlert, setActiveAlert] = React.useState<{ item: ScheduleItem; message: string } | null>(null);
  const [notifications, setNotifications] = React.useState<ReminderNotification[]>([]);
  const notifiedIdsRef = React.useRef<Set<string>>(new Set());

  // Save changes to localStorage
  React.useEffect(() => {
    saveSchedule(scheduleItems);
  }, [scheduleItems]);

  React.useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  React.useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Automatic Background Reminder Engine
  React.useEffect(() => {
    const checkReminders = () => {
      if (settings.dndMode) return; // Do Not Disturb active

      const now = new Date();
      const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todayDateStr = now.toISOString().slice(0, 10);

      for (const item of scheduleItems) {
        if (!item.reminderEnabled) continue;

        const matchesDay = item.specificDate ? item.specificDate === todayDateStr : item.dayOfWeek === currentDayOfWeek;
        if (!matchesDay) continue;

        const startM = timeToMinutes(item.startTime);
        const reminderLead = item.reminderOffsetMinutes ?? 10;
        const triggerMinute = startM - reminderLead;

        const notifKey = `${item.id}-${todayDateStr}-${triggerMinute}`;

        if (currentMinutes >= triggerMinute && currentMinutes <= triggerMinute + 1) {
          if (!notifiedIdsRef.current.has(notifKey)) {
            notifiedIdsRef.current.add(notifKey);

            const msg = reminderLead === 0 ? '現在開始！' : `${reminderLead} 分鐘後開始`;

            setActiveAlert({ item, message: msg });

            if (settings.soundEnabled) {
              playChimeSound('reminder');
            }

            if (settings.vibrationEnabled) {
              triggerVibration([120, 80, 150]);
            }

            if (
              typeof Notification !== 'undefined' &&
              Notification.permission === 'granted' &&
              settings.browserNotificationsEnabled
            ) {
              try {
                new Notification(`提醒：${item.title}`, {
                  body: `${item.startTime} ${item.location ? `地點：${item.location}` : ''} (${msg})`,
                  icon: '/favicon.ico',
                });
              } catch (e) {
                // Ignore
              }
            }

            const newNotif: ReminderNotification = {
              id: `notif-${Date.now()}`,
              scheduleItemId: item.id,
              title: item.title,
              timeString: `${item.startTime} (${msg})`,
              dayOrDate: DAY_NAMES[item.dayOfWeek].short,
              location: item.location,
              timestamp: Date.now(),
              isRead: false,
              type: 'upcoming',
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 12000);
    checkReminders();
    return () => clearInterval(interval);
  }, [scheduleItems, settings]);

  const handleDropTemplateOnSlot = (
    tpl: TimeBlockTemplate,
    dayOfWeek: number,
    startTime: string
  ) => {
    const endTime = calculateEndTime(startTime, tpl.defaultDuration);
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      templateId: tpl.id,
      title: tpl.title,
      category: tpl.category,
      colorId: tpl.colorId,
      iconName: tpl.iconName,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes: tpl.defaultDuration,
      location: tpl.defaultLocation,
      notes: tpl.defaultNotes,
      isRecurringWeekly: true,
      reminderEnabled: tpl.reminderEnabled,
      reminderOffsetMinutes: tpl.reminderOffsetMinutes,
      isCompleted: false,
    };

    setScheduleItems((prev) => [...prev, newItem]);
    playChimeSound('drop');
  };

  const handleMoveItem = (itemId: string, newDayOfWeek: number, newStartTime: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const dur = item.durationMinutes || (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
          const newEndTime = calculateEndTime(newStartTime, dur);
          return {
            ...item,
            dayOfWeek: newDayOfWeek,
            startTime: newStartTime,
            endTime: newEndTime,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItemDuration = (itemId: string, newDurationMinutes: number) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const clampedDur = Math.max(15, Math.min(360, newDurationMinutes));
          const newEndTime = calculateEndTime(item.startTime, clampedDur);
          return {
            ...item,
            durationMinutes: clampedDur,
            endTime: newEndTime,
          };
        }
        return item;
      })
    );
    playChimeSound('drop');
    triggerVibration([25]);
  };

  const handleToggleComplete = (itemId: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setScheduleItems((prev) => prev.filter((i) => i.id !== itemId));
    playChimeSound('delete');
  };

  const handleSaveItem = (item: ScheduleItem) => {
    setScheduleItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
  };

  const handleSaveTemplate = (tpl: TimeBlockTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === tpl.id);
      if (exists) {
        return prev.map((t) => (t.id === tpl.id ? tpl : t));
      }
      return [...prev, tpl];
    });
  };

  const handleDeleteTemplate = (tplId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== tplId));
    if (activePlacementTemplate?.id === tplId) {
      setActivePlacementTemplate(null);
    }
    playChimeSound('delete');
  };

  const handleResetSchedule = () => {
    setScheduleItems(DEFAULT_SCHEDULE_ITEMS);
    setTemplates(DEFAULT_TEMPLATES);
  };

  const handleImportData = (items: ScheduleItem[], newTpls?: TimeBlockTemplate[]) => {
    setScheduleItems(items);
    if (newTpls && Array.isArray(newTpls)) {
      setTemplates(newTpls);
    }
  };

  const unreadRemindersCount = notifications.filter((n) => !n.isRead).length;

  return (
    <MobileFrame isPhoneFrame={settings.phoneFrameMode} darkMode={settings.darkMode}>
      <div
        className={`flex flex-col h-full w-full overflow-hidden font-sans transition-colors ${
          settings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        {/* Top Header & Navigation Bar */}
        <HeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          onOpenReminderCenter={() => setIsReminderCenterOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenCreateItem={() => {
            setEditorMode('scheduleItem');
            setEditingItem(null);
            setSlotDefaults({ dayOfWeek: 1, startTime: '09:10' });
            setIsEditorOpen(true);
          }}
          activePlacementTemplate={activePlacementTemplate}
          onCancelPlacement={() => setActivePlacementTemplate(null)}
          unreadRemindersCount={unreadRemindersCount}
        />

        {/* Live Active/Upcoming Event Floating Banner */}
        <CurrentEventBanner
          scheduleItems={scheduleItems}
          darkMode={settings.darkMode}
          onToggleComplete={handleToggleComplete}
          onSelectItem={(item) => {
            setEditorMode('scheduleItem');
            setEditingItem(item);
            setIsEditorOpen(true);
          }}
        />

        {/* Main Content Area: Responsive Layout */}
        <main className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          {/* Active View Container */}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative">
            {activeTab === 'timetable' && (
              <ViewTimetable
                scheduleItems={scheduleItems}
                settings={settings}
                templates={templates}
                activePlacementTemplate={activePlacementTemplate}
                onDropTemplateOnSlot={handleDropTemplateOnSlot}
                onMoveItem={handleMoveItem}
                onUpdateItemDuration={handleUpdateItemDuration}
                onSelectItem={(item) => {
                  setEditorMode('scheduleItem');
                  setEditingItem(item);
                  setIsEditorOpen(true);
                }}
                onDeleteItem={handleDeleteItem}
                onToggleComplete={handleToggleComplete}
                onOpenCreateWithSlot={(dayOfWeek, startTime) => {
                  setEditorMode('scheduleItem');
                  setEditingItem(null);
                  setSlotDefaults({ dayOfWeek, startTime });
                  setIsEditorOpen(true);
                }}
              />
            )}

            {activeTab === 'daily' && (
              <ViewDaily
                scheduleItems={scheduleItems}
                settings={settings}
                activePlacementTemplate={activePlacementTemplate}
                onDropTemplateOnSlot={handleDropTemplateOnSlot}
                onSelectItem={(item) => {
                  setEditorMode('scheduleItem');
                  setEditingItem(item);
                  setIsEditorOpen(true);
                }}
                onDeleteItem={handleDeleteItem}
                onToggleComplete={handleToggleComplete}
              />
            )}

            {activeTab === 'calendar' && (
              <ViewCalendar
                scheduleItems={scheduleItems}
                settings={settings}
                activePlacementTemplate={activePlacementTemplate}
                onDropTemplateOnSlot={handleDropTemplateOnSlot}
                onSelectItem={(item) => {
                  setEditorMode('scheduleItem');
                  setEditingItem(item);
                  setIsEditorOpen(true);
                }}
                onOpenCreateItemWithDate={(dateStr, dayOfWeek) => {
                  setEditorMode('scheduleItem');
                  setEditingItem(null);
                  setSlotDefaults({ dayOfWeek, startTime: '09:00', dateStr });
                  setIsEditorOpen(true);
                }}
              />
            )}

            {/* Standalone Blocks tab when viewed on small mobile screen */}
            {activeTab === 'blocks' && (
              <div className="h-full flex flex-col">
                <FrequentBlocksDrawer
                  templates={templates}
                  activePlacementTemplate={activePlacementTemplate}
                  darkMode={settings.darkMode}
                  onSelectForPlacement={(tpl) => {
                    setActivePlacementTemplate(tpl);
                    if (tpl) {
                      setActiveTab('timetable');
                    }
                  }}
                  onOpenCreateTemplate={() => {
                    setEditorMode('template');
                    setEditingTemplate(null);
                    setIsEditorOpen(true);
                  }}
                  onEditTemplate={(tpl) => {
                    setEditorMode('template');
                    setEditingTemplate(tpl);
                    setIsEditorOpen(true);
                  }}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </div>
            )}
          </div>

          {/* Persistent Side Drawer on Desktop view when in Timetable or Daily view */}
          {!settings.phoneFrameMode && (activeTab === 'timetable' || activeTab === 'daily') && (
            <div
              className={`hidden lg:block w-80 h-full shrink-0 border-l ${
                settings.darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <FrequentBlocksDrawer
                templates={templates}
                activePlacementTemplate={activePlacementTemplate}
                darkMode={settings.darkMode}
                onSelectForPlacement={setActivePlacementTemplate}
                onOpenCreateTemplate={() => {
                  setEditorMode('template');
                  setEditingTemplate(null);
                  setIsEditorOpen(true);
                }}
                onEditTemplate={(tpl) => {
                  setEditorMode('template');
                  setEditingTemplate(tpl);
                  setIsEditorOpen(true);
                }}
                onDeleteTemplate={handleDeleteTemplate}
              />
            </div>
          )}
        </main>

        {/* Real-time Alert Toast Banner */}
        {activeAlert && (
          <NotificationToast
            item={activeAlert.item}
            message={activeAlert.message}
            darkMode={settings.darkMode}
            onDismiss={() => setActiveAlert(null)}
            onSnooze={() => {
              setActiveAlert(null);
              setTimeout(() => {
                setActiveAlert({
                  item: activeAlert.item,
                  message: '（延後提醒）行程已到！',
                });
                playChimeSound('reminder');
              }, 5 * 60 * 1000);
            }}
          />
        )}

        {/* Horizontal Frequent Blocks Banner Dock across the bottom */}
        <FrequentBlocksBanner
          templates={templates}
          activePlacementTemplate={activePlacementTemplate}
          onSelectForPlacement={setActivePlacementTemplate}
          onDropTemplateOnSlot={handleDropTemplateOnSlot}
          onOpenManagePinned={() => setIsManagePinnedOpen(true)}
          onOpenCreateTemplate={() => {
            setEditorMode('template');
            setEditingTemplate(null);
            setIsEditorOpen(true);
          }}
          darkMode={settings.darkMode}
        />

        {/* Manage Pinned Quick Blocks Modal (決定哪些方塊要放在這裡) */}
        <ManagePinnedBlocksModal
          isOpen={isManagePinnedOpen}
          onClose={() => setIsManagePinnedOpen(false)}
          templates={templates}
          onUpdateTemplates={(updated) => setTemplates(updated)}
          onOpenCreateTemplate={() => {
            setIsManagePinnedOpen(false);
            setEditorMode('template');
            setEditingTemplate(null);
            setIsEditorOpen(true);
          }}
          darkMode={settings.darkMode}
        />

        {/* Modals */}
        <BlockEditorModal
          mode={editorMode}
          initialTemplate={editingTemplate}
          initialItem={editingItem}
          defaultDayOfWeek={slotDefaults.dayOfWeek}
          defaultStartTime={slotDefaults.startTime}
          defaultDate={slotDefaults.dateStr}
          darkMode={settings.darkMode}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
            setEditingItem(null);
          }}
          onSaveTemplate={handleSaveTemplate}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
        />

        <ReminderCenterModal
          isOpen={isReminderCenterOpen}
          onClose={() => {
            setIsReminderCenterOpen(false);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
          scheduleItems={scheduleItems}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
        />

        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          scheduleItems={scheduleItems}
          darkMode={settings.darkMode}
        />

        <QuickSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          scheduleItems={scheduleItems}
          onResetSchedule={handleResetSchedule}
          onImportData={handleImportData}
        />
      </div>
    </MobileFrame>
  );
}
