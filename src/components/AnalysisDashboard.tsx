import React, { useState, useEffect } from "react";
import { PropertyCase, Stage1Data, Stage6Data } from "../types";
import { RiskGauge } from "./StatWidgets";
import { PrecedentAndStrategyPanel } from "./PrecedentAndStrategyPanel";
import { 
  Scale, FileText, CheckCircle, AlertCircle, ArrowRight, MapPin, 
  User, ShieldAlert, Gavel, Calendar, IndianRupee, HelpCircle, FileCheck,
  Landmark, ChevronRight, ShieldCheck, Sparkles, AlertTriangle
} from "lucide-react";

interface AnalysisDashboardProps {
  key?: any;
  caseData: PropertyCase;
  onUpdateCase: (updatedCase: PropertyCase, historyDesc?: string) => void;
}

export function AnalysisDashboard({ caseData, onUpdateCase }: AnalysisDashboardProps) {
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState(caseData.stage1?.category || "வருவாய்");
  const [tempSpecificType, setTempSpecificType] = useState(caseData.stage1?.specificType || "");

  useEffect(() => {
    if (caseData) {
      setAvailableDocs(caseData.stage6?.available || []);
      setMissingDocs(caseData.stage6?.missing || []);
      setTempCategory(caseData.stage1?.category || "வருவாய்");
      setTempSpecificType(caseData.stage1?.specificType || "");
    }
  }, [caseData]);

  const handleSaveCategory = () => {
    const updatedCase: PropertyCase = {
      ...caseData,
      stage1: {
        category: tempCategory,
        specificType: tempSpecificType
      }
    };
    onUpdateCase(updatedCase, `முதன்மையான பிரிவு மாற்றப்பட்டது: "${tempCategory}" (${tempSpecificType})`);
    setIsEditingCategory(false);
  };

  const handleToggleDoc = (doc: string, currentlyAvailable: boolean) => {
    let newAvailable = [...availableDocs];
    let newMissing = [...missingDocs];

    if (currentlyAvailable) {
      newAvailable = newAvailable.filter(d => d !== doc);
      if (!newMissing.includes(doc)) {
        newMissing.push(doc);
      }
    } else {
      newMissing = newMissing.filter(d => d !== doc);
      if (!newAvailable.includes(doc)) {
        newAvailable.push(doc);
      }
    }

    setAvailableDocs(newAvailable);
    setMissingDocs(newMissing);

    const updatedCase: PropertyCase = {
      ...caseData,
      stage6: {
        available: newAvailable,
        missing: newMissing
      }
    };
    onUpdateCase(updatedCase, `ஆதார பட்டியல்: "${doc}" மாற்றப்பட்டது: ${currentlyAvailable ? "இல்லை" : "உள்ளது"}`);
  };

  const getCategoryColor = (cat: string) => {
    const c = cat?.toLowerCase() || "";
    if (c.includes("revenue") || c.includes("வருவாய்")) {
      return "bg-purple-100 text-purple-900 border-purple-200";
    } else if (c.includes("registration") || c.includes("பதிவு") || c.includes("பத்திர")) {
      return "bg-indigo-100 text-indigo-900 border-indigo-200";
    } else if (c.includes("family") || c.includes("inheritance") || c.includes("குடும்ப") || c.includes("வாரிசு")) {
      return "bg-sky-100 text-sky-900 border-sky-200";
    } else if (c.includes("government") || c.includes("அரசு")) {
      return "bg-amber-100 text-amber-900 border-amber-200";
    } else if (c.includes("public") || c.includes("பொது")) {
      return "bg-rose-100 text-rose-900 border-rose-200";
    } else if (c.includes("litigation") || c.includes("நீதிமன்ற") || c.includes("வழக்கு")) {
      return "bg-red-100 text-red-900 border-red-200";
    }
    return "bg-slate-100 text-slate-900 border-slate-200";
  };

  const scrollToSection = (id: string, stageNum: number) => {
    setActiveStage(stageNum);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const authoritySteps = Array.isArray(caseData.stage7) 
    ? caseData.stage7 
    : (typeof caseData.stage7 === "object" && caseData.stage7?.route ? caseData.stage7.route : []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start text-slate-900">
      
      {/* 1. Left Sidebar: Stage Navigation (Analysis Framework) */}
      <nav className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl flex flex-col p-4 shrink-0 shadow-sm sticky top-20 z-10 print:hidden no-print">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
          <Scale className="h-4 w-4 text-purple-700" />
          <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">மதிப்பீட்டுக் கட்டமைப்பு</h2>
        </div>
        
        <div className="space-y-1 max-h-[350px] lg:max-h-none overflow-y-auto pr-1">
          {[
            { num: "00", name: "வழக்கு அடையாளங்கள்", id: "stage-00" },
            { num: "01", name: "வழக்கின் பிரிவு", id: "stage-01" },
            { num: "02", name: "மூலப் பிரச்சனை", id: "stage-02" },
            { num: "03", name: "சொத்து வகை", id: "stage-03" },
            { num: "04", name: "தகராறு நிகழ்வு", id: "stage-04" },
            { num: "05", name: "பாதிக்கப்பட்ட உரிமை", id: "stage-05" },
            { num: "06", name: "ஆவணங்கள் வரைபடம்", id: "stage-06" },
            { num: "07", name: "வருவாய் அதிகாரி வழி", id: "stage-07" },
            { num: "08", name: "பரிகார வழிமுறை", id: "stage-08" },
            { num: "09", name: "அச்சுறுத்தல் வீதம்", id: "stage-09" },
            { num: "10", name: "வழங்கப்படும் தீர்வுகள்", id: "stage-10" },
            { num: "11", name: "முன்மாதிரி தீர்ப்புகள்", id: "stage-11" },
            { num: "12", name: "சட்ட உத்தி சிமுலேட்டர்", id: "stage-11" }
          ].map((stg, i) => {
            const isHighlighted = activeStage === i;
            return (
              <button
                key={stg.num}
                type="button"
                onClick={() => scrollToSection(stg.id, i)}
                className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer text-left ${
                  isHighlighted 
                    ? "text-purple-900 bg-purple-100 border border-purple-300 font-bold" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded mr-2.5 text-[9px] font-bold ${
                  isHighlighted ? "bg-purple-700 text-white font-black" : "border border-slate-300 text-slate-600 bg-slate-50"
                }`}>
                  {stg.num}
                </span>
                <span className="truncate">{stg.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. Central Case Data View */}
      <div className="flex-1 w-full space-y-6">
        
        {/* Case Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="pl-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-1.5">
                <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <span>AIEOS</span>
                  <ChevronRight className="h-2.5 w-2.5 text-purple-500" />
                  <span>Citizen360</span>
                  <ChevronRight className="h-2.5 w-2.5 text-purple-500" />
                  <span>{caseData.subWorkspace || caseData.stage0?.subWorkspace || "Property360"}</span>
                  <ChevronRight className="h-2.5 w-2.5 text-purple-500" />
                  <span>{caseData.module || caseData.stage0?.module || "Engine"}</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                  வழக்கு ID: UK360-{caseData.stage0?.district?.toUpperCase().slice(0,3) || "TN"}-{caseData.id?.slice(-4) || "0000"}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  சர்வே எண் #{caseData.stage0?.surveyNumber} • {caseData.stage0?.village}, {caseData.stage0?.district}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none font-display">
                {caseData.stage0?.clientName} அவர்களின் வழக்கு மேலாண்மை
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 font-medium flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5 text-purple-700" />
                வட்டம் (தாலுகா): {caseData.stage0?.taluk || "N/A"} | எதிர் தரப்பினர்: {caseData.stage0?.oppositeParty || "N/A"}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start md:self-auto min-w-[150px]">
              <div className="text-left flex-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">அச்சுறுத்தல் நிலை</span>
                <span className="text-xs font-extrabold text-rose-700 block leading-tight">{caseData.stage9?.rating || "HIGH RISK"}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 leading-none">{caseData.stage9?.score || 45}</span>
                <span className="text-[9px] text-slate-500 font-bold block">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 00 Card: Intake Identifiers */}
        <div id="stage-00" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <span className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 00</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">வாடிக்கையாளர் வழக்கு அடையாளங்கள்</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">வாடிக்கையாளர் பெயர்</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.clientName || "N/A"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">கைபேசி எண்</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.mobile || "N/A"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">சர்வே எண்</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.surveyNumber || "N/A"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">கிராமம் & வட்டம் (தாலுகா)</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.village}, {caseData.stage0?.taluk}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">மாவட்டம்</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.district}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">எதிர் தரப்பினர்</span>
              <span className="font-bold text-rose-700">{caseData.stage0?.oppositeParty || "N/A"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">வழக்கறிஞர் வழக்கு உள்ளதா?</span>
              <span className="font-bold text-slate-900">{caseData.stage0?.existingAdvocate === "Yes" ? `ஆம் (${caseData.stage0?.existingCaseNumber || "வழக்கு நிலுவையில்"})` : "இல்லை"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">கால வரம்பு அச்சுறுத்தல்</span>
              <span className={`font-bold ${caseData.stage0?.limitationRisk === "Yes" ? "text-rose-700" : "text-emerald-700"}`}>
                {caseData.stage0?.limitationRisk === "Yes" ? "செயலில் உள்ள அச்சுறுத்தல் (அதிவேக)" : "எதுவுமில்லை"}
              </span>
            </div>
          </div>
        </div>

        {/* Stage 01 & 02 Card: Category & Root Cause */}
        <div id="stage-01" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div id="stage-02" className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <span className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 01 & 02</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">உள் பகுப்பாய்வு & கண்டறிதல்</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">மூலப் பிரச்சனையின் அறிக்கை</label>
              <p className="text-sm text-purple-950 italic border-l-3 border-purple-700 pl-3 py-2 font-medium bg-purple-50 rounded-r-lg">
                "{caseData.stage2?.rootCauseStatement || "பரஸ்பர ஒப்புதல் இன்றி பிரிக்கப்படாத சொத்துக்கு சர்ச்சை ஆவணம் செயல்படுத்தப்பட்டது."}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">வாடிக்கையாளர் கூறுவது</span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  "{caseData.stage2?.realIssue || "எல்லை வரம்புகள் அல்லது உரிமை மாற்றம் தொடர்பாக முரண்பாடுகள் தெரிவிக்கப்பட்டுள்ளன."}"
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 group relative">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">முதன்மையான பிரிவு</span>
                {isEditingCategory ? (
                  <div className="space-y-2 mt-1">
                    <select
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value)}
                      className="w-full text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded p-1.5 cursor-pointer focus:ring-1 focus:ring-purple-600"
                    >
                      <option value="Revenue" className="bg-white text-slate-900">வருவாய்த் துறை (Revenue)</option>
                      <option value="Registration" className="bg-white text-slate-900">பத்திரப்பதிவுத் துறை (Registration)</option>
                      <option value="Family / Inheritance" className="bg-white text-slate-900">குடும்பம் / வாரிசுரிமை (Family)</option>
                      <option value="Government Land" className="bg-white text-slate-900">அரசு நிலம் (Govt Land)</option>
                      <option value="Public Property" className="bg-white text-slate-900">பொதுச் சொத்து (Public)</option>
                      <option value="Litigation" className="bg-white text-slate-900">நீதிமன்ற வழக்கு (Litigation)</option>
                    </select>
                    <input
                      type="text"
                      value={tempSpecificType}
                      onChange={(e) => setTempSpecificType(e.target.value)}
                      placeholder="குறிப்பிட்ட தகராறு வகை"
                      className="w-full text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-purple-600"
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setTempCategory(caseData.stage1?.category || "வருவாய்");
                          setTempSpecificType(caseData.stage1?.specificType || "");
                          setIsEditingCategory(false);
                        }}
                        className="px-2.5 py-1 text-[10px] bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-bold cursor-pointer"
                      >
                        ரத்துசெய்
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCategory}
                        className="px-2.5 py-1 text-[10px] bg-purple-700 text-white rounded hover:bg-purple-800 font-bold cursor-pointer"
                      >
                        சேமி
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryColor(caseData.stage1?.category)}`}>
                        {caseData.stage1?.category}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{caseData.stage1?.specificType}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempCategory(caseData.stage1?.category || "வருவாய்");
                        setTempSpecificType(caseData.stage1?.specificType || "");
                        setIsEditingCategory(true);
                      }}
                      className="px-2 py-0.5 text-[10px] text-purple-700 hover:bg-purple-100 rounded border border-transparent hover:border-purple-300 transition cursor-pointer font-bold shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      மாற்று
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stage 03, 04, 05 Card: Subject/Property, Cause of Action & Rights Matrix */}
        <div id="stage-03" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div id="stage-04" className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span id="stage-05" className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 03, 04 & 05</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">வழக்கின் பொருள், வழக்கின் காரணம் (Cause of Action) & உரிமைகள் அணிவரிசை (Rights Matrix)</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">வழக்கின் பொருள் / சொத்து வகை</span>
              <span className="text-xs font-bold text-slate-900">
                {typeof caseData.stage3 === "object" ? caseData.stage3?.subjectType : (caseData.stage3 || "பூர்வீக சொத்து / சட்டப்பொருள்")}
              </span>
              {typeof caseData.stage3 === "object" && caseData.stage3?.partyRelationshipMap && (
                <span className="block text-[10px] text-purple-800 font-semibold mt-1">
                  உறவுமுறை: {caseData.stage3.partyRelationshipMap}
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">வழக்கின் காரணம் (Cause of Action)</span>
              {typeof caseData.stage4 === "object" && Array.isArray(caseData.stage4?.timelineEvents) ? (
                <div className="text-left space-y-1">
                  {caseData.stage4.timelineEvents.slice(0, 3).map((evt, idx) => (
                    <span key={idx} className="block text-[10px] font-semibold text-purple-900">
                      • {evt}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-bold text-purple-900">{String(caseData.stage4 || "தகராறு நிகழ்வு")}</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">பாதிக்கப்பட்ட உரிமை & கடமை மீறல்</span>
              {typeof caseData.stage5 === "object" ? (
                <div className="text-left text-[10px] space-y-1">
                  {caseData.stage5?.rightsViolated && caseData.stage5.rightsViolated.length > 0 && (
                    <span className="block font-bold text-rose-700">உரிமை மீறல்: {caseData.stage5.rightsViolated.join(", ")}</span>
                  )}
                  {caseData.stage5?.dutiesBreached && caseData.stage5.dutiesBreached.length > 0 && (
                    <span className="block font-medium text-slate-700">கடமை மீறல்: {caseData.stage5.dutiesBreached.join(", ")}</span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-800">{String(caseData.stage5 || "பாதிக்கப்பட்ட உரிமை")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stage 06 Card: Interactive Evidence Matrix */}
        <div id="stage-06" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 06</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ஆவணங்கள் வரைபடம் (ஊடாடும் சரிபார்ப்பு பட்டியல்)</h4>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            ஆவணங்களை தேர்வு செய்யவும் அல்லது நீக்கவும். சிவப்பு நிறத்தில் உள்ளவை இல்லாத ஆவணங்களைக் குறிக்கின்றன, இவற்றைத் திரட்டுவது மிக அவசியமான சேவையாகும்.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Documents */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">தளத்தில் உள்ள ஆவணங்கள் ({availableDocs.length})</span>
              {availableDocs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">சரிபார்க்கப்பட்ட ஆவணங்கள் எதுவும் இந்த வழக்குக் கோப்பில் இல்லை.</p>
              ) : (
                <div className="space-y-1.5">
                  {availableDocs.map((doc, idx) => (
                    <label 
                      key={idx} 
                      className="flex items-start gap-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 transition text-xs font-medium text-emerald-900"
                    >
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => handleToggleDoc(doc, true)}
                        className="mt-0.5 h-3.5 w-3.5 text-emerald-600 border-slate-300 rounded-sm cursor-pointer accent-emerald-600"
                      />
                      <span className="truncate">{doc}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Documents */}
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-2">இல்லாத ஆவணங்கள் / சேவை வாய்ப்புகள் ({missingDocs.length})</span>
              {missingDocs.length === 0 ? (
                <p className="text-xs text-emerald-800 font-bold italic flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="h-4 w-4" /> அனைத்து முக்கிய ஆதார ஆவணங்களும் சரிபார்க்கப்பட்டன!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {missingDocs.map((doc, idx) => (
                    <label 
                      key={idx} 
                      className="flex items-start gap-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer hover:bg-rose-100 transition text-xs font-medium text-slate-700"
                    >
                      <input 
                        type="checkbox" 
                        checked={false}
                        onChange={() => handleToggleDoc(doc, false)}
                        className="mt-0.5 h-3.5 w-3.5 text-rose-600 border-slate-300 rounded-sm cursor-pointer"
                      />
                      <span className="line-through text-slate-400 truncate">{doc}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stage 07 Card: Authority Route Steps */}
        <div id="stage-07" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <span className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 07</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">வருவாய் மற்றும் பதிவு அதிகாரி வழிப்பாதை</h4>
          </div>

          <p className="text-xs text-slate-600">
            தமிழ்நாடு நில வருவாய் விதிகளின்படி வழக்குகளின் தீர்வுக்காக அணுக வேண்டிய வரிசையான அரசு அலுவலகப் பாதை.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {authoritySteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl hover:border-purple-400 transition shrink-0 min-w-[130px] justify-center text-center">
                  <div>
                    <span className="text-[8px] text-slate-500 font-extrabold block uppercase tracking-wider">படி {idx + 1}</span>
                    <span className="text-xs font-bold text-slate-900">{step}</span>
                  </div>
                </div>
                {idx < authoritySteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stage 08 Card: Remedy Track Selection */}
        <div id="stage-08" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-purple-700 rounded mr-1"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">நிலை 08</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">முதன்மையான பரிகார வழிமுறை</h4>
            </div>
            <span className="text-[10px] bg-purple-100 border border-purple-200 text-purple-900 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
              {caseData.stage8?.category || "அதிகாரபூர்வ அரசு நடவடிக்கை"}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4 items-start">
            <div className="p-2 bg-purple-100 rounded-lg border border-purple-200 text-purple-800 shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">முதன்மையான மனு படிவம்</h4>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {caseData.stage8?.primaryRemedy || "வருவாய் விதிகளின் கீழ் பட்டா உட்பிரிவுக்கு எதிரான ஆட்சேபனை மனு."}
              </p>
            </div>
          </div>
        </div>

        {/* Stage 09: Threat Risk Gauge */}
        <div id="stage-09" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <RiskGauge score={caseData.stage9?.score || 45} rating={caseData.stage9?.rating || "Medium"} />
          </div>
          
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-slate-900">
            <div>
              <span className="text-[9px] font-extrabold text-rose-700 uppercase tracking-wider">அச்சுறுத்தல் கண்டறிதல்</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase mt-1 mb-2">இந்த மதிப்பெண் ஏன் கணக்கிடப்பட்டது:</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span><strong>கால வரம்புச் சட்டத்தின் தாக்கம்:</strong> தமிழ்நாடு வருவாய் விதிகளின் கீழ் பட்டா மாறுதல் தாமதங்களின் நிலை.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span><strong>கட்டுமானம் / சொத்து விற்பனை அச்சுறுத்தல்:</strong> எதிர்த்தரப்பினர் சொத்தை அனுபவத்தில் வைத்திருந்தால் அச்சுறுத்தல் அதிகமாகும்.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span><strong>ஆதாரங்களின் பற்றாக்குறை:</strong> மூலப்பத்திரம் இல்லாதது அரசு வழிமுறைகளில் தடையை அதிகரிக்கும்.</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>அச்சுறுத்தல் மதிப்பெண் தமிழ்நாடு வருவாய் சட்ட வழிகாட்டுதலின்படி கணக்கிடப்படுகிறது.</span>
            </div>
          </div>
        </div>

        {/* Stage 11 & 12 Precedent Intelligence & Strategy Simulator Panel */}
        <div id="stage-11" className="pt-2">
          <PrecedentAndStrategyPanel caseData={caseData} />
        </div>

      </div>

      {/* 3. Right Sidebar: Recommended Packages & Billing */}
      <aside id="stage-10" className="w-full lg:w-72 bg-white border border-slate-200 p-5 rounded-2xl shrink-0 flex flex-col space-y-6 print:hidden no-print shadow-sm">
        
        <h2 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-purple-700" />
          நிலை 10 - வழங்கப்படும் தீர்வு
        </h2>
        
        {/* Package Card */}
        <div className="bg-purple-50 border-2 border-purple-600 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-3 py-1 bg-purple-700 text-white text-[9px] font-black rounded-bl-xl uppercase tracking-wider">
            பரிந்துரைக்கப்படுகிறது
          </div>
          
          <div className="mt-2">
            <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider block">சேவை நிலை</span>
            <h5 className="text-sm font-black text-slate-900 font-display mb-1.5 leading-tight">{caseData.stage10?.packageName || "முழு ஆலோசனை சேவைத் தொகுப்பு"}</h5>
            <div className="text-2xl font-black text-purple-800 mb-3">{caseData.stage10?.priceRange || "₹8,500"}</div>
            
            <ul className="text-[11px] text-slate-700 space-y-2 mb-4 font-medium border-t border-purple-200 pt-3">
              <li className="flex items-start">
                <span className="text-purple-700 mr-2 font-bold">•</span>
                <span>தனிப்பயன் வருவாய் ஆட்சேபனை வரைவு</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2 font-bold">•</span>
                <span>மாவட்ட பதிவாளர் போலி பத்திர ரத்து மனு</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2 font-bold">•</span>
                <span>சான்றளிக்கப்பட்ட ஆவணங்கள் சரிபார்ப்பு</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white border border-purple-200 rounded-xl mb-4">
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">சேவை விபரங்கள்</span>
            <p className="text-[10px] text-slate-700 font-semibold leading-relaxed">
              {caseData.stage10?.description || "சட்டரீதியான வருவாய் அறிவிப்பு மற்றும் காலவரிசைப்படியான நடவடிக்கை வழிகாட்டி ஆகியவற்றை உள்ளடக்கியது."}
            </p>
          </div>

          <div className="text-xs text-center text-purple-900 font-bold bg-purple-200/60 border border-purple-300 py-2 rounded-xl">
            சேவை முன்மொழிவு தயார்
          </div>
        </div>

        {/* Live Assistant prompt status log */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">உதவியாளர் முனையம்</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider">செயல்பாட்டில் உள்ளது</span>
            </div>
          </div>
          
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-slate-700 leading-normal">
            {`${caseData.stage0?.district || "மாவட்டத்தில்"} பூர்வீக நிலத் தகராறு பகுப்பாய்வு செய்யப்படுகிறது... ${caseData.stage9?.score || 45}% அச்சுறுத்தல் காரணிகளைக் கண்டறிதல்... பிரிவு 77A முன்னோடிகளுக்கான சட்டத் தேடல் துவங்கப்படுகிறது...`}
          </div>
        </div>

      </aside>

    </div>
  );
}
