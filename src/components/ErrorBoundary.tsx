/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-white font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold">頁面暫時遇到狀況</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              您的排程資料已妥善保存在手機中，請點擊下方按鈕重新載入畫面。
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-rose-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新載入課表</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
