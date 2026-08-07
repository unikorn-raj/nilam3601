import React, { useState } from "react";
import { 
  Calculator, Landmark, ShieldCheck, DollarSign, FileText, 
  Printer, ArrowRight, X, AlertTriangle, CheckCircle2, ChevronRight, Scale
} from "lucide-react";

interface GuidelineCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DISTRICT_LIST = [
  "சென்னை (Chennai)",
  "காஞ்சிபுரம் (Kanchipuram)",
  "செங்கல்பட்டு (Chengalpattu)",
  "திருவள்ளூர் (Tiruvallur)",
  "கோயம்புத்தூர் (Coimbatore)",
  "மதுரை (Madurai)",
  "திருச்சிராப்பள்ளி (Tiruchirappalli)",
  "சேலம் (Salem)",
  "திருப்பூர் (Tiruppur)",
  "ஈரோடு (Erode)",
  "திருநெல்வேலி (Tirunelveli)",
  "வேலூர் (Vellore)",
  "தஞ்சாவூர் (Thanjavur)",
  "திண்டுக்கல் (Dindigul)",
  "தூத்துக்குடி (Thoothukudi)",
  "கன்னியாகுமரி (Kanyakumari)",
  "மற்ற மாவட்டங்கள் (Other Districts)"
];

export function GuidelineCalculatorModal({ isOpen, onClose }: GuidelineCalculatorModalProps) {
  const [district, setDistrict] = useState(DISTRICT_LIST[0]);
  const [landType, setLandType] = useState<"residential" | "commercial" | "agricultural" | "industrial">("residential");
  const [areaValue, setAreaValue] = useState<number>(2400); // Default 1 Ground = 2400 sqft
  const [areaUnit, setAreaUnit] = useState<"sqft" | "cent" | "ground" | "acre">("sqft");
  const [ratePerSqft, setRatePerSqft] = useState<number>(1500); // Default ₹1500/sqft
  const [considerationAmount, setConsiderationAmount] = useState<number>(0); // Actual sale value if higher than guideline value

  if (!isOpen) return null;

  // Convert area to sqft
  let areaInSqFt = areaValue;
  if (areaUnit === "cent") areaInSqFt = areaValue * 435.6;
  if (areaUnit === "ground") areaInSqFt = areaValue * 2400;
  if (areaUnit === "acre") areaInSqFt = areaValue * 43560;

  // Total Guideline Value
  const totalGuidelineValue = Math.round(areaInSqFt * ratePerSqft);
  
  // Taxable Value (Higher of Guideline Value or Actual Sale Value)
  const taxableValue = Math.max(totalGuidelineValue, considerationAmount || 0);

  // Tamil Nadu Registration Rates (Standard 7% Stamp Duty + 2% Registration Fee)
  const stampDutyRate = 0.07;
  const registrationFeeRate = 0.02;

  const stampDutyAmount = Math.round(taxableValue * stampDutyRate);
  const registrationFeeAmount = Math.round(taxableValue * registrationFeeRate);
  
  // Additional Statutory Fees
  const subdivisionFee = landType === "agricultural" ? 800 : 2000;
  const ecFee = 550;
  const totalExpenses = stampDutyAmount + registrationFeeAmount + subdivisionFee + ecFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded border border-amber-400/30">
                  TN Land Registration Calculator
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded border border-indigo-500/30">
                  வழிகாட்டி மதிப்பு & பதிவு கட்டணம்
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
                தமிழ்நாடு நில வழிகாட்டி மதிப்பு & முத்திரைத்தாள் கட்டணக் கணக்கீட்டு இயந்திரம்
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
          
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* District Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-amber-400" />
                <span>1. மாவட்டம் (District / SRO Zone):</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {DISTRICT_LIST.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Land Classification */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-amber-400" />
                <span>2. நிலத்தின் வகை (Classification):</span>
              </label>
              <select
                value={landType}
                onChange={(e) => setLandType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                <option value="residential">குடியிருப்பு நிலம் (Residential Plot / House)</option>
                <option value="commercial">வணிக வளாக நிலம் (Commercial Zone)</option>
                <option value="agricultural">விவசாய நிலம் (Agricultural Land / Nanja/Punja)</option>
                <option value="industrial">தொழில்முறை நிலம் (Industrial Zone)</option>
              </select>
            </div>

            {/* Area Quantity & Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>3. நிலத்தின் அளவு (Property Area):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={areaValue || ""}
                  onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  placeholder="2400"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 shrink-0"
                >
                  <option value="sqft">சதுர அடி (Sq.Ft)</option>
                  <option value="cent">சென்ட் (Cent)</option>
                  <option value="ground">கிரவுண்ட் (Ground - 2400 sqft)</option>
                  <option value="acre">ஏக்கர் (Acre - 43560 sqft)</option>
                </select>
              </div>
            </div>

            {/* Guideline Rate per Sq.Ft */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                <span>4. அரசின் வழிகாட்டி வீதம் (Rate per Sq.Ft in ₹):</span>
              </label>
              <input
                type="number"
                min="0"
                value={ratePerSqft || ""}
                onChange={(e) => setRatePerSqft(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                placeholder="1500"
              />
            </div>

            {/* Actual Sale Price (Optional) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>5. உண்மைப் பத்திர விற்பனைத் தொகை (Actual Deed Value - விருப்பத்தேர்வு):</span>
                <span className="text-[10px] text-slate-400 font-normal">*வழிகாட்டி மதிப்பை விட பத்திரத் தொகை அதிகமெனில் அதற்கு வரி விதிக்கப்படும்.</span>
              </label>
              <input
                type="number"
                min="0"
                value={considerationAmount || ""}
                onChange={(e) => setConsiderationAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                placeholder="0"
              />
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                பதிவுக் கட்டண அதிகாரப்பூர்வத் தொகுப்பு (Statutory Fee Breakdown)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                மொத்த பரப்பளவு: {areaInSqFt.toLocaleString()} Sq.Ft ({ (areaInSqFt/435.6).toFixed(2) } Cents)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">அரசு வழிகாட்டி மதிப்பு (Guideline Value):</span>
                <span className="font-mono font-black text-white">₹{totalGuidelineValue.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">கணக்கீட்டு வரித் தொகை (Taxable Base):</span>
                <span className="font-mono font-black text-amber-400">₹{taxableValue.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">முத்திரைத்தாள் கட்டணம் (7% Stamp Duty):</span>
                <span className="font-mono font-black text-emerald-400">₹{stampDutyAmount.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">பதிவுக் கட்டணம் (2% Registration Fee):</span>
                <span className="font-mono font-black text-indigo-400">₹{registrationFeeAmount.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">உட்பிரிவு / பட்டா கட்டணம் (Subdivision Fee):</span>
                <span className="font-mono font-black text-slate-300">₹{subdivisionFee.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">வில்லங்க சான்றிதழ் கட்டணம் (EC Fee):</span>
                <span className="font-mono font-black text-slate-300">₹{ecFee.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-200 block">மொத்த செலவினத் தொகை (Total Govt Fees Payable):</span>
                <span className="text-[10px] text-amber-400/80">சார்பதிவாளர் அலுவலகத்தில் (SRO) செலுத்த வேண்டிய தோராயக் கட்டணம்</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                ₹{totalExpenses.toLocaleString()}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>சட்ட விதிமுறை:</strong> தமிழ்நாடு பதிவுத் துறையின் வழிகாட்டுதலின்படி, சொத்தின் விற்பனைத் தொகையும் வழிகாட்டி மதிப்பும் வேறுபட்டால், இரண்டில் எது அதிகமோ அதற்கே முத்திரைத்தாள் கட்டணம் (7%) மற்றும் பதிவுக் கட்டணம் (2%) கணக்கிடப்படும்.
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>TN Registration Act Compliant Calculator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Printer className="h-4 w-4" />
              <span>அச்சிடுக (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
            >
              மூடுக (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
