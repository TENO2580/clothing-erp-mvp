import React from "react";
import { Shirt, RotateCcw, Sparkles, Store } from "lucide-react";
import { NAVY, ACCENT } from "../data/seedData";

export function Header({ onResetDemo, stats }) {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0" 
            style={{ background: NAVY }}
          >
            <Shirt size={20} color="#F5F5F4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold tracking-tight text-stone-900 leading-tight">
                Vastra Fashion House
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles size={10} /> Live ERP
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Gents · Kids · Women — Multi-Category Retail Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetDemo}
            title="Reset to initial seed data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 rounded-xl transition-all border border-stone-200"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
