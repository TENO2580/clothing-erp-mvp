import React, { useState } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { IOSInstallModal } from './IOSInstallModal';

export function PWAInstallButton({ isInstallable, isInstalled, isIOS, onInstall }) {
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed, don't show the button
  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS, don't show button
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (isInstallable && onInstall) {
      await onInstall();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title="Install Vastra ERP as an App"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 rounded-xl transition-all shadow-sm shadow-amber-900/20 active:scale-95 flex-shrink-0 animate-pulse"
      >
        <Download size={13} className="animate-bounce" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {isIOS && (
        <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
}
