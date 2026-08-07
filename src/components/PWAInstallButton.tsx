import React, { useState } from "react";
import { Download, CheckCircle2, Smartphone, Sparkles } from "lucide-react";
import { usePWA } from "../lib/pwa";

interface PWAInstallButtonProps {
  variant?: "header" | "floating" | "hero" | "banner";
  className?: string;
  onInstalled?: () => void;
}

export function PWAInstallButton({
  variant = "header",
  className = "",
  onInstalled,
}: PWAInstallButtonProps) {
  const { isInstallable, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If install is NOT available (or already installed in standalone mode), hide button completely
  if (!isInstallable && !justInstalled) {
    return null;
  }

  const handleClick = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    setIsInstalling(false);
    if (success) {
      setJustInstalled(true);
      if (onInstalled) onInstalled();
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md animate-in fade-in zoom-in-95">
        <CheckCircle2 className="h-4 w-4 text-emerald-200" />
        <span>Nilam360 நிறுவப்பட்டது!</span>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-1000">
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className={`px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-2xl shadow-emerald-500/30 border border-emerald-400/40 cursor-pointer transition-all active:scale-95 ${className}`}
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] text-emerald-200 font-bold leading-tight">1-Click PWA App</span>
            <span className="text-xs font-black leading-tight">Install Nilam360</span>
          </div>
        </button>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 border-b border-emerald-500/30 px-4 py-2.5 text-slate-100 flex items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-black text-white">ஆண்ட்ராய்டு / கணினியில் நிறுவ கிடைக்கிறது: </span>
            <span className="text-slate-300 hidden sm:inline">கூகுள் குரோம் மூலம் நேரடி 1-க்ளிக் நிறுவல்.</span>
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={isInstalling}
          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install Nilam360</span>
        </button>
      </div>
    );
  }

  // Default header / button variant
  return (
    <button
      onClick={handleClick}
      disabled={isInstalling}
      title="ஆண்ட்ராய்டு & கணினியில் செயலியை நிறுவுக (Install Nilam360 PWA)"
      className={`px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm border border-emerald-400/30 ${className}`}
    >
      <Download className="h-3.5 w-3.5 text-emerald-200 animate-pulse" />
      <span>Install Nilam360</span>
    </button>
  );
}
