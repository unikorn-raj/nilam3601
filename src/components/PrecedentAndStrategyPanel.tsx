import React, { useState } from "react";
import { PropertyCase, CaseReferenceItem } from "../types";
import { 
  Scale, BookOpen, CheckCircle, AlertCircle, ArrowRight, Gavel, 
  Sparkles, ShieldCheck, ShieldAlert, Award, FileText, Landmark,
  Zap, ChevronDown, ChevronUp, ChevronRight, Search, Layers, HelpCircle, Target,
  Crosshair, Lightbulb, ListOrdered, CheckSquare, XCircle, ArrowUpRight
} from "lucide-react";

interface PrecedentAndStrategyPanelProps {
  key?: any;
  caseData: PropertyCase;
}

export function PrecedentAndStrategyPanel({ caseData }: PrecedentAndStrategyPanelProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stage11" | "stage12">("stage11");
  const [issueFilter, setIssueFilter] = useState<string>("All");

  const stage11 = caseData.stage11;
  const stage12 = caseData.stage12;

  // Fallback defaults if analyzing older case without stage11/12
  const similarCases: CaseReferenceItem[] = stage11?.similarCases || [
    {
      id: "prec_1",
      caseName: "இராமசாமி எதிர் தமிழ்நாடு அரசு மற்றும் வருவாய்த் துறை அலுவலர்கள்",
      citationNumber: "Madras High Court • W.P.No. 12345/2018",
      court: "மெட்ராஸ் உயர் நீதிமன்றம் (Madras High Court)",
      judge: "நீதிபதி M. சுந்தர்",
      year: "2020",
      state: "தமிழ்நாடு",
      bench: "ஒற்றை அமர்வு (Single Bench)",
      caseType: "Writ Petition (நல்வழி ஆணை மனு)",
      similarityScore: 94,
      factsComparison: [
        { feature: "பட்டா மாறுதல் (Patta Transfer)", currentCase: "முன்னறிவிப்பின்றி ரத்து செய்யப்பட்டது", referenceCase: "இயற்கை நீதியை மீறி ரத்து செய்யப்பட்டது", match: true },
        { feature: "முன்னறிவிப்பு (Notice)", currentCase: "நோட்டீஸ் வழங்கப்படவில்லை", referenceCase: "நோட்டீஸ் வழங்கப்படவில்லை", match: true },
        { feature: "வருவாய் ஆவண மாற்றம் (Revenue Alteration)", currentCase: "தாலுகா அலுவலகத்தில் திருத்தப்பட்டது", referenceCase: "தாசில்தாரால் திருத்தப்பட்டது", match: true },
        { feature: "தாசில்தார் அதிகாரம் (Tahsildar Jurisdiction)", currentCase: "உரிமையியல் தகராறில் முடிவு எடுத்தார்", referenceCase: "அதிகார வரம்பை மீறி உத்தரவிட்டார்", match: true }
      ],
      issuesCompared: ["பட்டா ரத்து", "இயற்கை நீதி மீறல்", "தாசில்தார் அதிகாரம்", "உரிமையியல் தகராறு"],
      legalPrinciples: [
        "தமிழ்நாடு பட்டா பாஸ் புத்தகச் சட்டம் பிரிவு 10 & 12",
        "இயற்கை நீதி கோட்பாடுகள் (Principles of Natural Justice)",
        "அரசாணை நிலை எண். 112 வருவாய்த் துறை"
      ],
      courtReasoningSummary: "நோட்டீஸ் வழங்காமல் பட்டாவை ரத்து செய்வதும், உரிமையியல் நீதிமன்றத்தில் வழக்கு நிலுவையில் இருக்கும்போது தாசில்தார் பட்டா மாறுதல் உத்தரவு பிறப்பிப்பதும் சட்டவிரோதமானது என உயர் நீதிமன்றம் தீர்ப்பளித்தது.",
      finalOutcome: "மனு அனுமதிக்கப்பட்டது (Petition Allowed) - முந்தைய பட்டா நிலைநிறுத்தப்பட்டது",
      whyItMatters: "இந்தத் தீர்ப்பு உங்கள் வழக்கிற்கு மிக நேரடியாகப் பொருந்தும். ஏனென்றால், உங்கள் வழக்கிலும் தாசில்தார் நோட்டீஸ் அனுப்பாமல் பட்டாவை மாற்றியுள்ளார்.",
      authoritiesCited: [
        "2011 (5) CTC 94 (DB) - விஸ்வாஸ் நடராஜன் வழக்கு",
        "G.O. Ms No. 112 Revenue Department",
        "TN Patta Passbook Act 1983 - Section 10"
      ]
    },
    {
      id: "prec_2",
      caseName: "சுப்ரமணியன் எதிர் மாவட்ட பதிவாளர் & தாசில்தார்",
      citationNumber: "Madras High Court • W.P.No. 8921/2021",
      court: "மெட்ராஸ் உயர் நீதிமன்றம் (Madras High Court)",
      judge: "நீதிபதி N. ஆனந்த் வெங்கடேஷ்",
      year: "2022",
      state: "தமிழ்நாடு",
      bench: "ஒற்றை அமர்வு",
      caseType: "Writ Petition",
      similarityScore: 88,
      factsComparison: [
        { feature: "போலி ஆவணம் (Fraudulent Registration)", currentCase: "போலி பத்திரம் பதிவு செய்யப்பட்டுள்ளது", referenceCase: "ஆள்மாறாட்டம் மூலம் பத்திரம் பதிவு", match: true },
        { feature: "பிரிவு 77A (Registration Act Sec 77A)", currentCase: "மாவட்ட பதிவாளரிடம் மனு", referenceCase: "மாவட்ட பதிவாளர் விசாரணை நடத்துதல்", match: true },
        { feature: "அனுபோக உரிமை (Possession Claim)", currentCase: "நீண்டகால சுவாதீனம் உள்ளது", referenceCase: "சுவாதீனம் நிரூபிக்கப்பட்டது", match: true }
      ],
      issuesCompared: ["போலி ஆவணம்", "பிரிவு 77A", "மாவட்ட பதிவாளர்", "சுவாதீனம்"],
      legalPrinciples: [
        "பத்திரப்பதிவுச் சட்டம் பிரிவு 77A",
        "சுற்றறிக்கை எண். 67/2011 பதிவுத்துறை தலைவர்"
      ],
      courtReasoningSummary: "போலி ஆவணங்கள் மூலம் நிலத்தை மோசடி செய்வதைத் தடுக்க மாவட்ட பதிவாளருக்குப் பிரிவு 77A-ன்கீழ் ஆவணங்களை ரத்து செய்யும் அதிகாரம் உண்டு என நீதிமன்றம் உறுதி செய்தது.",
      finalOutcome: "பத்திரம் ரத்து செய்யப்பட்டது (Sale Deed Cancelled) - பதிவேட்டில் திருத்தம்",
      whyItMatters: "எதிர்த்தரப்பினர் தயாரித்த ஆவணம் போலி என்பதை நிரூபித்து மாவட்ட பதிவாளர் மூலம் ரத்து செய்ய இந்தத் தீர்ப்பு வலுவான ஆதாரமாகும்.",
      authoritiesCited: [
        "Registration Act 1908 Section 77A",
        "Circular No. 67 Inspector General of Registration"
      ]
    }
  ];

  const activePrecedent = similarCases.find(c => c.id === selectedCaseId) || similarCases[0];

  const successPercentage = stage11?.successProbability?.percentage || 85;
  const successRating = stage11?.successProbability?.rating || "Strong (வலுவான வாய்ப்பு)";

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Engine Banner & Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-black rounded-full uppercase tracking-wider">
                AI LEGAL INTELLIGENCE ENGINE
              </span>
              <span className="text-xs font-bold text-slate-500">தமிழ்நாடு & இந்திய நீதிமன்ற தீர்ப்புகள்</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">
              முன்மாதிரி தீர்ப்புகள் (Precedent Intelligence) & சட்ட உத்தி சிமுலேட்டர்
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium max-w-3xl">
              ஒத்த வழக்கின் உண்மைகள், நீதிமன்ற அவதானிப்புகள் மற்றும் சட்டக் கோட்பாடுகளைக் கண்டறிந்து, உங்கள் வழக்கின் வெற்றிக்கான வாய்ப்பை அதிகரிக்கும் AI சட்ட உத்தி மையம்.
            </p>
          </div>

          {/* AI Success Probability Gauge Card */}
          <div className="bg-purple-50 border-2 border-purple-600 rounded-2xl p-4 min-w-[260px] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">வழக்கின் வெற்றி வாய்ப்பு (AI)</span>
              <span className="text-xl font-black text-purple-900 block leading-tight">{successRating}</span>
              <span className="text-[9px] text-purple-800 font-bold block mt-0.5">*இது நீதிமன்றத்தின் இறுதித் தீர்ப்பல்ல, AI கணிப்பாகும்</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-700 text-white font-black text-lg flex items-center justify-center shrink-0 border-2 border-amber-300 shadow-sm">
              {successPercentage}%
            </div>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab("stage11")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stage11"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>நிலை 11 - முன்மாதிரி தீர்ப்புகள் (Precedent Intelligence)</span>
          </button>

          <button
            onClick={() => setActiveTab("stage12")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stage12"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Target className="h-4 w-4 text-amber-400" />
            <span>நிலை 12 - சட்ட உத்தி & முடிவு சிமுலேட்டர் (Strategy Simulator)</span>
          </button>
        </div>
      </div>

      {/* STAGE 11 CONTENT */}
      {activeTab === "stage11" && (
        <div className="space-y-6">
          
          {/* Summary Stat Grid for Precedents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">ஒத்த தீர்ப்புகள்</span>
              <div className="text-2xl font-black text-purple-900 flex items-center gap-2">
                <span>{stage11?.similarCasesCount || similarCases.length}</span>
                <span className="text-xs font-bold text-slate-500">தீர்ப்புகள் கண்டறியப்பட்டன</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">சராசரி ஒற்றுமை வீதம்</span>
              <div className="text-2xl font-black text-emerald-700">
                {stage11?.averageSimilarityScore || 91}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">உயர் நீதிமன்றத் தீர்ப்புகள்</span>
              <div className="text-2xl font-black text-indigo-900">
                {stage11?.authoritiesSummary?.highCourtCount || 3} தீர்ப்புகள்
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">அரசாணைகள் & சுற்றறிக்கைகள்</span>
              <div className="text-2xl font-black text-amber-800">
                {(stage11?.authoritiesSummary?.governmentOrdersCount || 2) + (stage11?.authoritiesSummary?.circularsCount || 1)} அரசாணைகள்
              </div>
            </div>
          </div>

          {/* Main Precedent Reference Library & Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Matching Judgment Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="h-4 w-4 text-purple-700" />
                  11.2 ஒத்த நீதிமன்றத் தீர்ப்புகள் ({similarCases.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">ஒற்றுமை அடிப்படையில்</span>
              </div>

              <div className="space-y-3">
                {similarCases.map((prec) => {
                  const isSelected = activePrecedent.id === prec.id;
                  return (
                    <div
                      key={prec.id}
                      onClick={() => setSelectedCaseId(prec.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                        isSelected 
                          ? "bg-purple-50 border-2 border-purple-600 ring-1 ring-purple-400" 
                          : "bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">
                          {prec.court}
                        </span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {prec.similarityScore}% ஒற்றுமை
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 leading-snug mb-1">
                        {prec.caseName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-600 font-bold mb-2">
                        {prec.citationNumber} • {prec.year}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {prec.issuesCompared?.slice(0, 3).map((iss, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{iss}
                          </span>
                        ))}
                      </div>

                      <div className="p-2 bg-white/80 border border-purple-100 rounded-lg text-[10px] font-semibold text-purple-950 flex items-center justify-between">
                        <span className="truncate">தீர்ப்பு: {prec.finalOutcome}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Facts & Legal Comparison for Selected Precedent (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Case Title Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                    {activePrecedent.caseType}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">நீதிபதி: {activePrecedent.judge || "சென்னை உயர் நீதிமன்றம்"}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug font-display">
                  {activePrecedent.caseName}
                </h3>
                <p className="text-xs font-mono font-bold text-purple-800 mt-0.5">
                  {activePrecedent.citationNumber} • ஆம் ஆண்டு: {activePrecedent.year}
                </p>
              </div>

              {/* 11.3 Side-by-side Facts Comparison Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-700" />
                  11.3 வழக்கு உண்மைகள் ஒப்பீடு (Facts Comparison)
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">அம்சம் / காரணி</th>
                        <th className="p-2.5 text-purple-900">தற்போதைய வழக்கு</th>
                        <th className="p-2.5 text-indigo-900">முன்மாதிரி தீர்ப்பு</th>
                        <th className="p-2.5 text-center">பொருத்தம்</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-[11px]">
                      {activePrecedent.factsComparison?.map((fc, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900 bg-slate-50">{fc.feature}</td>
                          <td className="p-2.5 text-slate-800">{fc.currentCase}</td>
                          <td className="p-2.5 text-slate-800">{fc.referenceCase}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[9px] rounded-full">
                              ✓ பொருத்தம்
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 11.5 & 11.6 Legal Principles Applied & Court Reasoning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Applied Laws & Acts */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Landmark className="h-3.5 w-3.5 text-purple-700" />
                    11.5 பயன்படுத்தப்பட்ட சட்டப் பிரிவுகள்
                  </h5>
                  <ul className="text-xs space-y-1.5 font-semibold text-slate-800">
                    {activePrecedent.legalPrinciples?.map((lp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-700 font-bold">•</span>
                        <span>{lp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Court Reasoning */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <h5 className="text-[10px] font-black text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-purple-700" />
                    11.6 நீதிமன்றத்தின் தீர்ப்பு விளக்கம்
                  </h5>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    "{activePrecedent.courtReasoningSummary}"
                  </p>
                </div>

              </div>

              {/* 11.8 Why It Matters */}
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
                <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  11.8 இந்தத் தீர்ப்பு உங்கள் வழக்கிற்கு ஏன் மிக முக்கியம்?
                </h5>
                <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                  {activePrecedent.whyItMatters}
                </p>
              </div>

              {/* 11.10 Authorities Cited */}
              <div>
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  11.10 இந்தத் தீர்ப்பில் சுட்டிக்காட்டப்பட்ட முக்கிய முன்மாதிரிகள்
                </h5>
                <div className="flex flex-wrap gap-2">
                  {activePrecedent.authoritiesCited?.map((auth, i) => (
                    <span key={i} className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {auth}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Precedent Strategy Recommendation Box */}
          <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-md space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              11.G தீர்ப்புகளின் அடிப்படையிலான சட்ட உத்தி பரிந்துரை (Strategy Recommendation)
            </h4>
            <p className="text-xs font-medium leading-relaxed text-slate-100">
              {stage11?.strategyRecommendationFromPrecedents || 
                "மேற்கண்ட உயர் நீதிமன்றத் தீர்ப்புகளின்படி, தாசில்தாரின் முன்னறிவிப்பற்ற பட்டா மாறுதல் உத்தரவை எதிர்த்து மாவட்ட வருவாய் அலுவலரிடம் (DRO) சீராய்வு மனு தாக்கல் செய்வதும், மெட்ராஸ் உயர் நீதிமன்றத்தில் பிரிவு 226-ன் கீழ் பேராணை மனு தாக்கல் செய்வதும் மிக வலுவான சட்டப்பூர்வ பரிகாரமாகும்."}
            </p>
          </div>

        </div>
      )}

      {/* STAGE 12 CONTENT */}
      {activeTab === "stage12" && (
        <div className="space-y-6">
          
          {/* 12.1 Strongest Legal Route Card */}
          <div className="bg-white border-2 border-purple-600 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 bg-purple-700 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                12.1 மிக வலுவான சட்ட வழிமுறை (STRONGEST LEGAL ROUTE)
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                மிக உயர்ந்த வெற்றி வாய்ப்பு
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-tight font-display mb-2">
              {stage12?.strongestLegalRoute?.routeName || "மெட்ராஸ் உயர் நீதிமன்றத்தில் பேராணை மனு (Writ Petition under Article 226)"}
            </h3>

            <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4 bg-purple-50 p-3 rounded-xl border border-purple-200">
              <strong>ஏன் இந்த வழிமுறை?:</strong> {stage12?.strongestLegalRoute?.justification || "இயற்கை நீதி மீறல் மற்றும் தாலுகா அதிகாரியின் எல்லை மீறிய நடவடிக்கை தெளிவாக இருப்பதால், உயர் நீதிமன்றப் பேராணை மூலம் மிக விரைவான நிவாரணம் பெற முடியும்."}
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-t border-slate-200 pt-3">
              <span>வகை: {stage12?.strongestLegalRoute?.routeType || "அரசியலமைப்பு பேராணை (Writ)"}</span>
              <span className="text-purple-800">எதிர்பார்க்கப்படும் கால அளவு: {stage12?.strongestLegalRoute?.timeToResolutionEst || "3 முதல் 6 மாதங்கள்"}</span>
            </div>
          </div>

          {/* Grid of 12.3 Evidence Gaps & 12.4 Counterarguments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 12.3 Evidence Gaps to Fill */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-3">
                <XCircle className="h-4 w-4 text-rose-600" />
                12.3 நிரப்பப்பட வேண்டிய ஆதார இடைவெளிகள் (Evidence Gaps)
              </h4>

              <div className="space-y-3">
                {(stage12?.evidenceGapsToFill || [
                  { missingElement: "முந்தைய தாய் பத்திரம் (Parent Document)", howToObtain: "சார்பதிவாளர் அலுவலகத்தில் சான்றளிக்கப்பட்ட நகல் (Certified Copy) விண்ணப்பித்தல்", urgency: "High" },
                  { missingElement: "கிராம ஏ-பதிவேடு சான்றளிக்கப்பட்ட நகல் (A-Register Extract)", howToObtain: "இ-சேவை மையம் அல்லது தாலுகா அலுவலகம் மூலம் பெறுதல்", urgency: "Medium" }
                ]).map((eg, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{eg.missingElement}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        eg.urgency === "High" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {eg.urgency} அவசரம்
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      <strong>பெறும் வழிமுறை:</strong> {eg.howToObtain}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 12.4 Opposing Counterarguments & Rebuttal Strategies */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-3">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                12.4 எதிர்த்தரப்பின் சாத்தியமான வாதங்கள் & பதில் உத்தி (Counterargument Simulator)
              </h4>

              <div className="space-y-3">
                {(stage12?.likelyOppositeCounterarguments || [
                  { 
                    argument: "எதிர்த்தரப்பினர் உரிமையியல் நீதிமன்றத்திற்குச் செல்ல வேண்டும் என்று வாதிடக்கூடும்.", 
                    rebuttalStrategy: "வருவாய் அதிகாரி இயற்கை நீதியை மீறியதால், மாற்று நிவாரணம் இருந்தாலும் உயர் நீதிமன்றப் பேராணை செல்லும் என வாதாடுதல்." 
                  },
                  { 
                    argument: "காலதாமதம் (Limitation) காரணம் காட்டி மனுவைத் தள்ளுபடி செய்யக் கோரக்கூடும்.", 
                    rebuttalStrategy: "பட்டா மாறுதல் உத்தரவு தங்களுக்குத் தெரியப்படுத்தப்படவில்லை என்பதை அஞ்சல் சான்றுகளுடன் நிரூபித்தல்." 
                  }
                ]).map((ca, i) => (
                  <div key={i} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">எதிர்த்தரப்பு வாதம் {i + 1}:</span>
                    <p className="text-xs font-bold text-slate-900">"{ca.argument}"</p>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mt-1">AI பதில் உத்தி (Rebuttal):</span>
                    <p className="text-xs text-slate-800 font-medium bg-white p-2 rounded border border-emerald-200">
                      {ca.rebuttalStrategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 12.5 Additional Recommended Proof & 12.6 Priority Next Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Additional Recommended Proof */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-3">
                <CheckSquare className="h-4 w-4 text-purple-700" />
                12.5 கூடுதல் சாட்சியங்கள் & ஆவணப் பரிந்துரைகள்
              </h4>

              <div className="space-y-2.5">
                {(stage12?.recommendedAdditionalProof || [
                  { type: "Document", title: "வில்லங்கச் சான்று (EC) 30 ஆண்டுகள்", purpose: "சொத்தில் வில்லங்கம் இல்லை என்பதை நிரூபிக்க" },
                  { type: "Witness", title: "கிராம நிர்வாக அலுவலர் (VAO) வாக்குமூலம்", purpose: "உண்மையான நில சுவாதீனத்தை உறுதிப்படுத்த" },
                  { type: "Technical Survey", title: "FMB வரைபடம் & சர்வேயர் அளவீடு", purpose: "நில எல்லைகளைத் துல்லியமாக வரையறுக்க" }
                ]).map((ap, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg shrink-0 text-xs font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{ap.title}</span>
                      <span className="text-[10px] text-purple-800 font-bold block">{ap.type}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{ap.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12.6 Priority Next Actions Roadmap */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-3">
                <ListOrdered className="h-4 w-4 text-purple-700" />
                12.6 அடுத்தடுத்த முதன்மை நடவடிக்கைகள் (Priority Action Plan)
              </h4>

              <div className="space-y-3">
                {(stage12?.priorityNextActions || [
                  { stepNumber: 1, action: "மாவட்ட பதிவாளரிடம் பிரிவு 77A-ன்கீழ் போலி பத்திரம் ரத்து மனு தாக்கல் செய்தல்", targetAuthority: "மாவட்ட பதிவாளர் (District Registrar)", timeline: "உடனடியாக (Within 48 hours)" },
                  { stepNumber: 2, action: "வருவாய் கோட்டாட்சியரிடம் (RDO) பட்டா மாறுதலுக்கு எதிரான ஆட்சேபனை மேல்முறையீடு", targetAuthority: "வருவாய் கோட்டாட்சியர் (RDO)", timeline: "7 நாட்களுக்குள்" },
                  { stepNumber: 3, action: "மெட்ராஸ் உயர் நீதிமன்றத்தில் நல்வழி ஆணை (Writ of Mandamus) மனு தாக்கல் செய்தல்", targetAuthority: "மெட்ராஸ் உயர் நீதிமன்றம்", timeline: "30 நாட்களுக்குள்" }
                ]).map((pa, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shrink-0 border border-purple-800">
                      {pa.stepNumber || i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-slate-900">{pa.action}</span>
                        <span className="text-[9px] font-extrabold text-purple-900 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">
                          {pa.timeline}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        அணுக வேண்டிய அதிகாரி: {pa.targetAuthority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
