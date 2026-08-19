import React from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function PWAUpdateToast({ needRefresh, onUpdate, onDismiss }) {
  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 z-50 bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">New Version Available</h4>
            <p className="text-[11px] text-stone-300 mt-0.5">
              An update has been deployed. Update to access the latest features.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-800">
        <button
          onClick={onUpdate}
          className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={12} className="animate-spin" /> Update Now
        </button>
        <button
          onClick={onDismiss}
          className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}
