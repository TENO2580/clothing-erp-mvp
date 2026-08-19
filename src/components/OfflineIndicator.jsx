import React from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';

export function OfflineIndicator({ isOffline, justReconnected }) {
  if (justReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all animate-in slide-in-from-top-2 duration-300">
        <Wifi size={14} className="text-emerald-200" />
        <span>Connected — Internet restored. Local data active.</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-200 border-b border-amber-800/40 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md transition-all">
        <div className="flex items-center gap-2">
          <WifiOff size={14} className="text-amber-400 animate-pulse" />
          <span>
            <strong className="text-white">Offline Mode Active:</strong> You can continue creating bills, checking inventory, and editing data offline.
          </span>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-700/50">
          Local Storage Active
        </span>
      </div>
    );
  }

  return null;
}
