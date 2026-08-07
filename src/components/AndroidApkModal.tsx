import React, { useState } from "react";
import { 
  Smartphone, Download, SmartphoneNfc, Globe, ShieldCheck, 
  ExternalLink, CheckCircle2, Copy, Check, ArrowRight, X, AlertCircle, Laptop
} from "lucide-react";
import { UnikornLogo } from "./UnikornLogo";
import { usePWA } from "../lib/pwa";

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AndroidApkModal({ isOpen, onClose }: AndroidApkModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { isInstallable, promptInstall } = usePWA();
  const [activeTab, setActiveTab] = useState<"pwa" | "apk" | "export">("pwa");

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== "undefined" ? window.location.origin : "https://ais-dev-73jobqr7m5wll6uggsbrwr-165866840927.asia-southeast1.run.app";

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      alert("உங்கள் ஆண்ட்ராய்டு போனின் Chrome உலாவியில் 'Add to Home screen' அல்லது 'Install app' தேர்வு செய்து நேரடியாக நிலம்360 AI செயலியை நிறுவலாம்.");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UnikornLogo size="md" showText={false} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded border border-emerald-500/30">
                  Android App & PWA
                </span>
                <span className="text-[10px] text-amber-300 font-bold">Unikorn360 AI Solutions</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
                ஆண்ட்ராய்டு போனில் நிலம்360 AI செயலியை நிறுவுதல்
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-2 border-b border-slate-800 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab("pwa")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "pwa"
                ? "bg-emerald-600 text-white font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <SmartphoneNfc className="h-4 w-4" />
            <span>1-க்ளிக் ஆண்ட்ராய்டு நிறுவல் (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab("apk")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "apk"
                ? "bg-emerald-600 text-white font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>APK உருவாக்க வழிகாட்டி (Bubblewrap)</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "export"
                ? "bg-emerald-600 text-white font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Android Studio மூலக் குறியீடு</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* TAB 1: PWA Direct Installation */}
          {activeTab === "pwa" && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <ShieldCheck className="h-5 w-5" />
                  <span>முழு ஆண்ட்ராய்டு செயலி அனுபவம் (Web App PWA)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  கூகுள் பிளே ஸ்டோர் தேவையின்றி, உங்கள் ஆண்ட்ராய்டு ஸ்மார்ட்போனில் இந்த இணைய செயலியை நேரடியாக ஒரு நேட்டிவ் ஆண்ட்ராய்டு செயலியாகவே (Native Mobile App) நிறுவலாம்.
                </p>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-200">
                  <div className="font-extrabold text-amber-300">ஆண்ட்ராய்டு Chrome-ல் நிறுவும் வழிமுறை:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                    <li>உங்கள் ஆண்ட்ராய்டு போனில் <strong>Google Chrome</strong> உலாவியில் இந்த முகவரியைத் திறக்கவும்.</li>
                    <li>மேல் வலது மூலையிலுள்ள <strong>மூன்று புள்ளிகள் (⋮)</strong> மெனுவை கிளிக் செய்யவும்.</li>
                    <li><strong>'Add to Home screen'</strong> அல்லது <strong>'Install app'</strong> என்பதைத் தேர்ந்தெடுக்கவும்.</li>
                    <li>இப்போது உங்கள் போன் ஹோம் ஸ்கிரீனில் <strong>நிலம்360 AI</strong> செயலி லோகோவுடன் தனி பயன்பாடாக தோன்றும்!</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>{isInstallable ? "ஆண்ட்ராய்டு போனில் நேரடியாக நிறுவுக" : "Chrome-ல் செயலியை நிறுவுக"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open(currentAppUrl, "_blank")}
                    className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 text-emerald-400" />
                    <span>புதிய உலாவியில் திறக்குக</span>
                  </button>
                </div>
              </div>

              {/* App Link Box */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="truncate text-xs font-mono text-slate-400">
                  {currentAppUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-700"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedUrl ? "நகலெடுக்கப்பட்டது" : "லிங்க் காப்பி செய்ய"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: APK Building Guide */}
          {activeTab === "apk" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-400" />
                  <span>Bubblewrap மூலம் நேரடி .APK தயாரித்தல் (Trusted Web Activity - TWA)</span>
                </div>
                <p className="leading-relaxed">
                  கூகுளின் அதிகாரப்பூர்வ <strong>Bubblewrap CLI (Node.js)</strong> கருவியைப் பயன்படுத்தி, இந்த PWA இணைய செயலியை 1 நிமிடத்தில் சுயாதீன <code>.apk</code> கோப்பாக மாற்றலாம்:
                </p>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 space-y-2 overflow-x-auto">
                  <div># 1. Bubblewrap CLI-ஐ கணினியில் நிறுவவும்:</div>
                  <div className="text-white bg-slate-950 p-2 rounded border border-slate-800">npm i -g @bubblewrap/cli</div>

                  <div className="pt-2"># 2. நிலம்360 AI செயலியை APK-ஆக மாற்ற கட்டளை இயங்கவும்:</div>
                  <div className="text-white bg-slate-950 p-2 rounded border border-slate-800">bubblewrap init --manifest={currentAppUrl}/manifest.json</div>

                  <div className="pt-2"># 3. ஆண்ட்ராய்டு APK கோப்பை பில்ட் செய்ய:</div>
                  <div className="text-white bg-slate-950 p-2 rounded border border-slate-800">bubblewrap build</div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  *குறிப்பு: பில்ட் முடிவடைந்ததும் உருவாக்கப்படும் <code>app-release-signed.apk</code> கோப்பை நேரடியாக உங்கள் ஆண்ட்ராய்டு மொபைலில் நிறுவி இயக்கலாம்!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Export Source Code to Android Studio */}
          {activeTab === "export" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  <span>AI Studio-விலிருந்து மூலக் குறியீடு (Source Code) பதிவிறக்கம்</span>
                </div>
                <p className="leading-relaxed">
                  இந்த நிலம்360 AI பயன்பாட்டின் முழு மூலக் குறியீட்டையும் (React + Vite + TypeScript) AI Studio இடைமுகத்தில் உள்ள <strong>Export to GitHub / Download ZIP</strong> மெனு மூலம் பதிவிறக்கலாம்:
                </p>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="font-bold text-white">Android Studio Capacitor / WebView ஒருங்கிணைப்பு:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>AI Studio மேல் வலது மெனுவில் <strong>Export / Download ZIP</strong> என்பதை அழுத்தவும்.</li>
                    <li><code>npm run build</code> இயக்கி உருவாக்கப்படும் <code>dist/</code> கோப்புறையை பயன்படுத்தவும்.</li>
                    <li><code>npx cap add android</code> மற்றும் <code>npx cap open android</code> மூலம் Android Studio-வில் திறக்கவும்.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>நிலம்360 AI • ஆண்ட்ராய்டு பதிப்பு ஆதரவு</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            மூடுக (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
