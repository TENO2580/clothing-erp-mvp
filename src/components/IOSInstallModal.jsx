import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';
import { Modal } from './UIComponents';

export function IOSInstallModal({ open, onClose }) {
  if (!open) return null;

  return (
    <Modal open={open} title="Install Vastra ERP on iPhone / iPad" onClose={onClose}>
      <div className="space-y-4 text-stone-800">
        {/* App Preview Card */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
          <div className="w-12 h-12 rounded-xl bg-[#1E2233] flex items-center justify-center shadow-md flex-shrink-0">
            <img src="/icons/icon-192.png" alt="Vastra ERP" className="w-10 h-10 rounded-lg" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-stone-900 text-sm">Vastra Fashion ERP</h4>
            <p className="text-xs text-stone-500">Standalone Retail App for iOS</p>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-stone-100 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">Tap the Share Button</p>
              <p className="text-stone-500 mt-0.5">
                In Safari toolbar at the bottom of your screen, tap the{' '}
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Share size={12} /> Share
                </span>{' '}
                icon.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-stone-100 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              2
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">Select "Add to Home Screen"</p>
              <p className="text-stone-500 mt-0.5">
                Scroll down the share sheet menu and tap{' '}
                <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                  <PlusSquare size={12} /> Add to Home Screen
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-stone-100 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              3
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">Confirm by tapping "Add"</p>
              <p className="text-stone-500 mt-0.5">
                Tap <span className="font-bold text-amber-800">Add</span> in the top-right corner. The Vastra ERP icon will appear on your Home Screen!
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
          <span>Works offline with fullscreen native experience.</span>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </Modal>
  );
}
