import React, { useState } from "react";
import { 
  Clock, Landmark, AlertTriangle, Calendar, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronRight, Scale, X, Hourglass
} from "lucide-react";

interface RevenueAppealsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REVENUE_STAGES = [
  {
    id: "patta_rdo",
    title: "வட்டாட்சியர் (Tahsildar) உத்தரவு ➔ ஆர்.டி.ஓ (RDO) மேல்முறையீடு",
    act: "தமிழ்நாடு பட்டா பாஸ் புக்குச் சட்டம் பிரிவு 10 (TN Patta Pass Book Act Sec 10)",
    statutoryDays: 30,
    authority: "வருவாய் கோட்டாட்சியர் (Revenue Divisional Officer - RDO)",
    description: "வட்டாட்சியர் பட்டா மாற்ற மறுப்பு அல்லது தவறான பட்டா வழங்கிய உத்தரவை எதிர்த்து 30 நாட்களுக்குள் RDO நீதிமன்றத்தில் மேல்முறையீடு செய்ய வேண்டும்."
  },
  {
    id: "rdo_dro",
    title: "RDO உத்தரவு ➔ மாவட்ட வருவாய் அலுவலர் (DRO) சீராய்வு மனு",
    act: "தமிழ்நாடு பட்டா பாஸ் புக்குச் சட்டம் பிரிவு 13 (TN Patta Pass Book Act Sec 13)",
    statutoryDays: 30,
    authority: "மாவட்ட வருவாய் அலுவலர் (District Revenue Officer - DRO)",
    description: "RDO வழங்கிய தீர்ப்பை எதிர்த்து மாவட்ட ஆட்சியர் / DRO-விடம் 30 நாட்களுக்குள் Revision Petition தாக்கல் செய்யப்பட வேண்டும்."
  },
  {
    id: "dro_cla",
    title: "DRO உத்தரவு ➔ நில நிர்வாக ஆணையர் (CLA) அல்லது உயர்நீதிமன்றம்",
    act: "இந்திய அரசியல் அமைப்பு சட்டம் பிரிவு 226 (Constitution Article 226 Writ)",
    statutoryDays: 90,
    authority: "நில நிர்வாக ஆணையர் (Commissioner of Land Administration) / சென்னை உயர்நீதிமன்றம்",
    description: "DRO சீராய்வு மனு முடிவை எதிர்த்து CLA அல்லது உயர்நீதிமன்றத்தில் Writ Petition தாக்கல் செய்வதற்கான அவகாசம்."
  },
  {
    id: "sec_77a",
    title: "போலி ஆவண ரத்து (Fraudulent Deed Cancellation) - பதிவுத் துறை",
    act: "தமிழ்நாடு பதிவுச் சட்டம் பிரிவு 77A (Registration Act Section 77A / 77B)",
    statutoryDays: 30,
    authority: "மாவட்ட பதிவாளர் (District Registrar - Administration)",
    description: "போலியான ஆவணம் அல்லது ஆள்மாறாட்டப் பத்திரங்களை ரத்து செய்யக் கோரி மாவட்ட பதிவாளரிடம் மனு அளித்தல மற்றும் DIG Appeal."
  }
];

export function RevenueAppealsTrackerModal({ isOpen, onClose }: RevenueAppealsTrackerModalProps) {
  const [selectedStageId, setSelectedStageId] = useState(REVENUE_STAGES[0].id);
  const [orderDate, setOrderDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  if (!isOpen) return null;

  const currentStage = REVENUE_STAGES.find((s) => s.id === selectedStageId) || REVENUE_STAGES[0];

  // Calculate Expiry Date
  const startDate = orderDate ? new Date(orderDate) : new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + currentStage.statutoryDays);

  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 7;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-inner">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded border border-indigo-500/30">
                  Revenue Limitation Act
                </span>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded border border-amber-400/30">
                  மேல்முறையீட்டு காலக்கெடு
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
                வருவாய் நீதிமன்ற மேல்முறையீட்டு சட்டப்பூர்வ காலக்கெடு கணக்கீட்டான்
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Stage Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>1. மேல்முறையீட்டு கட்டத்தைத் தேர்ந்தெடுக்கவும் (Appeal Stage):</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {REVENUE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                    selectedStageId === stage.id
                      ? "bg-indigo-950/80 border-indigo-500/80 text-white shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-amber-300 mb-0.5">{stage.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{stage.act}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-indigo-300 rounded-lg text-[10px] font-black shrink-0">
                    {stage.statutoryDays} நாட்கள்
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>2. உத்தரவு நகல் பெற்ற தேதி (Order Receipt / Copy Service Date):</span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Live Calculation Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isExpired
                ? "bg-rose-950/80 border-rose-500/80 text-rose-200"
                : isUrgent
                ? "bg-amber-950/80 border-amber-500/80 text-amber-200"
                : "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
            }`}>
              <div className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Hourglass className="h-4 w-4 shrink-0" />
                  <span>சட்டப்பூர்வ இறுதித் தேதி (Statutory Deadline):</span>
                </div>
                <div className="text-sm font-mono font-extrabold text-white">
                  {expiryDate.toLocaleDateString("ta-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>

              <div className="text-right">
                {isExpired ? (
                  <span className="px-3 py-1.5 bg-rose-500 text-white font-black text-xs rounded-lg uppercase tracking-wider inline-block">
                    காலக்கெடு முடிவடைந்தது! ({Math.abs(daysLeft)} நாட்கள் தாமதம்)
                  </span>
                ) : (
                  <div className="text-xl font-mono font-black text-amber-300">
                    {daysLeft} நாட்கள் எஞ்சியுள்ளன
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-300">அதிகாரம் & நடைமுறை விளக்கம்:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentStage.description}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>TN Revenue Limitation Act Engine</span>
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
