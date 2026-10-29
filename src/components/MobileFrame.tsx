/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  isPhoneFrame: boolean;
  darkMode?: boolean;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ isPhoneFrame, darkMode = false, children }) => {
  const [clockTime, setClockTime] = React.useState('09:41');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isPhoneFrame) {
    return (
      <div className={`h-full w-full flex flex-col overflow-hidden transition-colors ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-2 sm:p-6 transition-colors ${
      darkMode ? 'bg-slate-950/90' : 'bg-slate-100/90'
    }`}>
      {/* Phone chassis */}
      <div className={`w-full max-w-[430px] h-[92vh] max-h-[920px] rounded-[48px] p-2.5 shadow-2xl border-4 flex flex-col relative overflow-hidden transition-colors ${
        darkMode
          ? 'bg-slate-900 ring-1 ring-white/10 shadow-indigo-950/40 border-slate-700/80'
          : 'bg-slate-800 ring-1 ring-black/5 shadow-slate-300 border-slate-700'
      }`}>
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-2.5 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900/90 ring-1 ring-slate-800" />
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-950 ring-1 ring-indigo-500/40" />
        </div>

        {/* Mobile Status Bar */}
        <div className="h-7 w-full flex items-center justify-between px-6 pt-1 text-[11px] font-bold text-slate-300 select-none z-30 shrink-0">
          <span className="font-mono">{clockTime}</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* App Content inside screen */}
        <div className={`flex-1 w-full rounded-[36px] overflow-hidden flex flex-col relative border ${
          darkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-slate-200'
        }`}>
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="h-4 w-full flex items-center justify-center pt-1 shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
