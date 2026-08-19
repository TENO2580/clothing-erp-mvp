import React from "react";
import { Shirt, RotateCcw, Sparkles, Download } from "lucide-react";
import { NAVY } from "../data/seedData";
import { PWAInstallButton } from "./PWAInstallButton";

export function Header({ onResetDemo, onExportAll, isInstallable, isInstalled, isIOS, onInstall }) {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs pt-safe">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0" 
            style={{ background: NAVY }}
          >
            <Shirt size={18} color="#F5F5F4" className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-tight truncate">
                Vastra Fashion House
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                <Sparkles size={10} /> Live ERP
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-medium truncate">
              Gents · Kids · Women — Multi-Category Retail Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            isIOS={isIOS}
            onInstall={onInstall}
          />

          <button
            onClick={onExportAll}
            title="Download full ERP database backup"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all border border-stone-200"
          >
            <Download size={13} />
            <span className="hidden md:inline">Export Backup</span>
          </button>

          <button
            onClick={onResetDemo}
            title="Reset to initial seed data"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-all border border-transparent hover:border-stone-200"
          >
            <RotateCcw size={13} />
            <span className="hidden lg:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
