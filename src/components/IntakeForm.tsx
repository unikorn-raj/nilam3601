import React, { useState } from "react";
import { TN_DISTRICTS, SAMPLE_CASES, SampleCase } from "../data/constants";
import { IntakeData } from "../types";
import { WorkspaceRegistry, WorkspaceId, SubWorkspaceId, ModuleId, AIEngineId, ModuleConfig } from "../data/workspaceRegistry";
import { useLanguage } from "../lib/languageContext";
import { 
  FileText, Sparkles, MapPin, Phone, User, Landmark, ShieldAlert, ArrowRight, CornerDownRight, CheckCircle2, Zap, Lock, Scale, Building2, Gavel, Briefcase, HeartHandshake, Shield, Cpu, HelpCircle, Compass, FileCheck, ShoppingBag, HardHat, Receipt, Building, Handshake, Layers, Layers3, ChevronRight 
} from "lucide-react";

interface IntakeFormProps {
  onSubmit: (intake: IntakeData, rawDescription: string) => void;
  isLoading: boolean;
  currentCaseCount?: number;
  maxCases?: number;
  onOpenPricing?: () => void;
}

export function IntakeForm({ onSubmit, isLoading, currentCaseCount = 0, maxCases = 2, onOpenPricing }: IntakeFormProps) {
  const { t } = useLanguage();
  const [workspace, setWorkspace] = useState<WorkspaceId>("Citizen360");

  const [subWorkspace, setSubWorkspace] = useState<SubWorkspaceId>("Property360");
  const [activeModule, setActiveModule] = useState<ModuleId>("Registration");
  const [activeEngine, setActiveEngine] = useState<AIEngineId>("CaseClassificationAI");
  const [isAutoRouted, setIsAutoRouted] = useState(false);

  const [intake, setIntake] = useState<IntakeData>({
    workspace: "Citizen360",
    subWorkspace: "Property360",
    module: "Registration",
    engine: "CaseClassificationAI",
    clientName: "",
    mobile: "",
    surveyNumber: "",
    village: "",
    taluk: "",
    district: "Madurai",
    oppositeParty: "",
    partyRelationship: "",
    courtOrForum: "",
    existingAdvocate: "No",
    existingCaseNumber: "",
    limitationRisk: "No"
  });

  const [rawDescription, setRawDescription] = useState("");

  const handleSubWorkspaceSwitch = (sw: SubWorkspaceId) => {
    setSubWorkspace(sw);
    setIsAutoRouted(false);
    if (sw === "Property360") {
      setActiveModule("Registration");
      setIntake(prev => ({ 
        ...prev, 
        workspace: "Citizen360",
        subWorkspace: "Property360",
        module: "Registration",
        engine: activeEngine
      }));
    } else {
      setActiveModule("Criminal360");
      setIntake(prev => ({ 
        ...prev, 
        workspace: "Citizen360",
        subWorkspace: "Legal360",
        module: "Criminal360",
        engine: activeEngine
      }));
    }
  };

  const handleModuleSelect = (modId: ModuleId) => {
    setActiveModule(modId);
    setIsAutoRouted(false);

    setIntake(prev => ({
      ...prev,
      workspace: "Citizen360",
      subWorkspace,
      module: modId,
      engine: activeEngine
    }));
  };

  const handleEngineSelect = (engId: AIEngineId) => {
    setActiveEngine(engId);
    setIntake(prev => ({
      ...prev,
      engine: engId
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIntake(prev => ({ ...prev, [name]: value }));
  };

  const handleNarrativeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawDescription(text);
    if (text.trim().length > 15) {
      const auto = WorkspaceRegistry.autoRouteByDescription(text);
      if (auto) {
        setSubWorkspace(auto.subWorkspace);
        setActiveModule(auto.module);
        setActiveEngine(auto.engine);
        setIsAutoRouted(true);
        setIntake(prev => ({
          ...prev,
          workspace: auto.workspace,
          subWorkspace: auto.subWorkspace,
          module: auto.module,
          engine: auto.engine
        }));
      }
    }
  };

  const loadSampleCase = (sample: SampleCase) => {
    const sw: SubWorkspaceId = (sample.intake.subWorkspace as SubWorkspaceId) || "Property360";
    const mod: ModuleId = (sample.intake.module as ModuleId) || "Registration";
    setSubWorkspace(sw);
    setActiveModule(mod);
    setIntake({
      workspace: "Citizen360",
      subWorkspace: sw,
      module: mod,
      engine: (sample.intake.engine as AIEngineId) || "CaseClassificationAI",
      clientName: sample.intake.clientName,
      mobile: sample.intake.mobile,
      surveyNumber: sample.intake.surveyNumber || "",
      village: sample.intake.village || "",
      taluk: sample.intake.taluk || "",
      district: sample.intake.district,
      oppositeParty: sample.intake.oppositeParty,
      partyRelationship: sample.intake.partyRelationship || "",
      courtOrForum: sample.intake.courtOrForum || "",
      existingAdvocate: sample.intake.existingAdvocate,
      existingCaseNumber: sample.intake.existingCaseNumber,
      limitationRisk: sample.intake.limitationRisk
    });
    setRawDescription(sample.rawDescription);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDescription.trim()) {
      alert("தயவுசெய்து வழக்குத் தகராறின் மூல விளக்கத்தை வழங்கவும்.");
      return;
    }
    if (currentCaseCount >= maxCases) {
      if (onOpenPricing) onOpenPricing();
      return;
    }
    onSubmit(intake, rawDescription);
  };

  return (
    <div id="intake-form-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col text-slate-900">
      
      {/* 1. Header Hero with Workspace Architecture */}
      <div className="p-6 border-b border-slate-200 bg-purple-900 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-purple-800 text-purple-100 font-extrabold text-[10px] rounded uppercase tracking-wider border border-purple-700 flex items-center gap-1">
                <Layers className="h-3 w-3 text-purple-300" />
                AIEOS WORKSPACES:
              </span>
              {WorkspaceRegistry.WORKSPACES.map(w => {
                const isActive = workspace === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      if (w.isAvailable) {
                        setWorkspace(w.id);
                      } else {
                        alert(`${w.titleEn} is an upcoming workspace in the AIEOS Roadmap.`);
                      }
                    }}
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-wider border transition cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? "bg-white text-purple-950 border-white shadow-xs"
                        : w.isAvailable
                        ? "bg-purple-950 text-purple-200 border-purple-700 hover:text-white"
                        : "bg-purple-950/40 text-purple-400 border-purple-800/60 opacity-60"
                    }`}
                  >
                    <span>{w.titleEn}</span>
                    {!w.isAvailable && (
                      <span className="text-[8px] bg-purple-900 text-purple-300 px-1 py-0.1 rounded font-normal">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
            <h2 className="text-xl font-black text-white font-display leading-tight flex items-center gap-2">
              <Sparkles className="h-5.5 w-5.5 text-purple-200" />
              {t("Citizen360 முதன்மை சட்ட மையம்", "Citizen360 Primary Legal Hub")}
            </h2>
            <p className="text-xs text-purple-100 mt-1 max-w-2xl font-normal">
              {t(
                "சொத்து வாழ்க்கைச் சுழற்சி (Property360) மற்றும் அனைத்து சட்டத் துறை மேலாண்மை (Legal360) கொண்ட ஒருங்கிணைந்த AI சட்டத் தீர்வு தளம்.",
                "Integrated AI resolution platform for Property Lifecycle (Property360) and All Legal Domains (Legal360)."
              )}
            </p>
          </div>
        </div>

        {/* SubWorkspace Selection Tabs (Property360 vs Legal360) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-purple-950/70 p-1.5 rounded-xl border border-purple-700/50">
          <button
            type="button"
            onClick={() => handleSubWorkspaceSwitch("Property360")}
            className={`px-4 py-2.5 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              subWorkspace === "Property360"
                ? "bg-white text-purple-950 shadow-sm"
                : "text-purple-200 hover:text-white hover:bg-purple-800/50"
            }`}
          >
            <Landmark className="h-4 w-4 shrink-0" />
            <span>{t("1. Property360 (சொத்து வாழ்க்கைச் சுழற்சி)", "1. Property360 (Land & Property Lifecycle)")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubWorkspaceSwitch("Legal360")}
            className={`px-4 py-2.5 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              subWorkspace === "Legal360"
                ? "bg-white text-purple-950 shadow-sm"
                : "text-purple-200 hover:text-white hover:bg-purple-800/50"
            }`}
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span>{t("2. Legal360 (அனைத்து சட்டத் துறை மையம்)", "2. Legal360 (All Legal Domains)")}</span>
          </button>
        </div>
      </div>


      {/* Sample Cases Quick Loader Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            மாதிரி வழக்குகள் (Quick Loaders):
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {SAMPLE_CASES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSampleCase(sample)}
                className="px-2.5 py-1 text-[11px] font-bold bg-white text-purple-900 border border-slate-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition cursor-pointer whitespace-nowrap shadow-2xs"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Form Area */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6 bg-white">

        {/* Module Selection Panel */}
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Gavel className="h-4 w-4 text-purple-700" />
              <span>{subWorkspace} - பிரத்யேக தொகுதிகள் (Modules):</span>
            </label>
            {isAutoRouted && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                AI Auto-Routed Module
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {subWorkspace === "Property360" && (
              WorkspaceRegistry.PROPERTY360_MODULES.map(m => {
                const isSelected = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModuleSelect(m.id)}
                    className={`p-3 text-left rounded-xl text-xs font-bold border transition flex flex-col justify-between gap-1 cursor-pointer relative ${
                      isSelected
                        ? "bg-purple-900 text-white border-purple-900 shadow-sm"
                        : "bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-[11px] truncate">{m.titleEn}</span>
                      {m.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isSelected ? "bg-purple-800 text-purple-100" : "bg-purple-100 text-purple-800"
                        }`}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-normal line-clamp-1 ${isSelected ? "text-purple-200" : "text-slate-500"}`}>
                      {m.titleTa}
                    </span>
                  </button>
                );
              })
            )}

            {subWorkspace === "Legal360" && (
              WorkspaceRegistry.LEGAL360_MODULES.map(m => {
                const isSelected = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModuleSelect(m.id)}
                    className={`p-3 text-left rounded-xl text-xs font-bold border transition flex flex-col justify-between gap-1 cursor-pointer relative ${
                      isSelected
                        ? "bg-purple-900 text-white border-purple-900 shadow-sm"
                        : "bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-[11px] truncate">{m.titleEn}</span>
                    </div>
                    <span className={`text-[10px] font-normal line-clamp-1 ${isSelected ? "text-purple-200" : "text-slate-500"}`}>
                      {m.titleTa}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* AI Engine Selection Panel */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-700" />
              <span>
                {activeModule === "Consumer360" 
                  ? "Consumer360 AI Agents (7 Specialized Agents):" 
                  : "AI Engine (இயக்க எஞ்சின்):"}
              </span>
            </label>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              {activeModule === "Consumer360" ? "7 Consumer360 Agents" : "6 Specialized Engines"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {(activeModule === "Consumer360" 
              ? WorkspaceRegistry.CONSUMER360_AI_AGENTS 
              : WorkspaceRegistry.STANDARD_AI_ENGINES
            ).map(e => {
              const isSelected = activeEngine === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleEngineSelect(e.id)}
                  className={`p-2.5 text-left rounded-xl text-xs font-bold border transition flex flex-col justify-between gap-1 cursor-pointer relative ${
                    isSelected
                      ? "bg-indigo-950 text-white border-indigo-950 shadow-xs"
                      : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <span className="font-extrabold text-[11px] truncate">{e.nameEn}</span>
                  <span className={`text-[9.5px] font-normal line-clamp-1 ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                    {e.nameTa}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Grid: Legal Identifiers & Parties */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-purple-800 uppercase tracking-widest flex items-center gap-1">
            <span>01.</span> கட்சிகள் & அடையாளங்கள்
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-purple-700" />
                வாடிக்கையாளர் / மனுதாரர் பெயர் <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={intake.clientName}
                onChange={handleChange}
                placeholder="எ.கா: ரமேஷ் குமார்"
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                கைபேசி எண்
              </label>
              <input
                type="text"
                name="mobile"
                value={intake.mobile}
                onChange={handleChange}
                placeholder="9845012345"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-rose-600" />
                எதிர் தரப்பினர் (Opposite Party) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                name="oppositeParty"
                value={intake.oppositeParty}
                onChange={handleChange}
                placeholder="எதிர்த்தரப்பு / நிறுவனம் / நபர்"
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
              />
            </div>

            {/* Dynamic fields based on Property vs General Legal */}
            {subWorkspace === "Property360" ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-purple-700" />
                    சர்வே எண் <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="surveyNumber"
                    value={intake.surveyNumber || ""}
                    onChange={handleChange}
                    placeholder="எ.கா: 142/3B"
                    required={subWorkspace === "Property360"}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    கிராமம் / பகுதி
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={intake.village || ""}
                    onChange={handleChange}
                    placeholder="மேலூர்"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    வட்டம் (தாலுகா)
                  </label>
                  <input
                    type="text"
                    name="taluk"
                    value={intake.taluk || ""}
                    onChange={handleChange}
                    placeholder="மேலூர்"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    கட்சிகளின் உறவுமுறை (Party Relationship)
                  </label>
                  <input
                    type="text"
                    name="partyRelationship"
                    value={intake.partyRelationship || ""}
                    onChange={handleChange}
                    placeholder="எ.கா: கடன் கொடுத்தவர்/வாங்கியவர், நிறுவனம்/ஊழியர், கணவன்/மனைவி"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    நீதிமன்றம் / அதிகாரம் / ஆணையம் (Court / Authority Forum)
                  </label>
                  <input
                    type="text"
                    name="courtOrForum"
                    value={intake.courtOrForum || ""}
                    onChange={handleChange}
                    placeholder="எ.கா: குற்றவியல் நடுவர் நீதிமன்றம், நுகர்வோர் ஆணையம், தொழிலாளர் நீதிமன்றம்"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition placeholder:text-slate-400"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                மாவட்டம் (தமிழ்நாடு)
              </label>
              <select
                name="district"
                value={intake.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition cursor-pointer"
              >
                {TN_DISTRICTS.map((dist, idx) => (
                  <option key={idx} value={dist} className="bg-white text-slate-900">
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                கால வரம்பு அச்சுறுத்தல் உள்ளதா?
              </label>
              <select
                name="limitationRisk"
                value={intake.limitationRisk}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition cursor-pointer"
              >
                <option value="No" className="bg-white text-slate-900">இல்லை (சமீபத்திய பிரச்சினை)</option>
                <option value="Yes" className="bg-white text-slate-900">ஆம் (பழைய / கால வரம்பு நெருங்கும் பிரச்சினை)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                வழக்கு நிலுவையில் உள்ளதா?
              </label>
              <div className="flex gap-2">
                <select
                  name="existingAdvocate"
                  value={intake.existingAdvocate}
                  onChange={handleChange}
                  className="w-1/3 px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition cursor-pointer"
                >
                  <option value="No" className="bg-white text-slate-900">இல்லை</option>
                  <option value="Yes" className="bg-white text-slate-900">ஆம்</option>
                </select>
                <input
                  type="text"
                  name="existingCaseNumber"
                  value={intake.existingCaseNumber}
                  onChange={handleChange}
                  disabled={intake.existingAdvocate === "No"}
                  placeholder="வழக்கு எண் / எஃப்.ஐ.ஆர் / நோட்டீஸ் Ref"
                  className="w-2/3 px-3.5 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition disabled:opacity-40 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Description Text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-purple-800 uppercase tracking-widest flex items-center gap-1.5">
              <span>02.</span> மூலப் பிரச்சினை & வழக்கு விபரம் (Case Problem & Narrative)
            </h3>
            <span className="text-[10px] font-bold text-slate-500">தேவையானது</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal font-medium">
            வாடிக்கையாளரின் தகவல், புகார், பத்திரம் அல்லது சட்டச் சுருக்கத்தை நகலெடுத்து இங்கே ஒட்டவும். எங்கள் UNIKORN360 தளம் 10-நிலை சட்டக் கட்டமைப்பின் படி சிக்கலைக் கண்டறிந்து, உரிமைகளை வகைப்படுத்தி, ஆதாரங்களை மதிப்பீடு செய்து, நடவடிக்கை திட்டத்தை வழங்கும்.
          </p>
          <textarea
            value={rawDescription}
            onChange={handleNarrativeChange}
            rows={5}
            required
            placeholder="மூலப் பிரச்சினை விபரத்தை இங்கே தட்டச்சு செய்யவும் அல்லது ஒட்டவும்..."
            className="w-full p-4 text-xs font-sans text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition leading-relaxed placeholder:text-slate-400"
          />
        </div>

        {/* Digital Evidence Locker & SHA-256 File Security Upload */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              <span>டிஜிட்டல் சான்றாதார பெட்டகம் (SHA-256 Evidence Locker)</span>
            </h4>
            <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              CLEAN VIRUS SCAN & TAMPER SEAL
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            பத்திரங்கள், காசோலைகள், ஒப்பீட்டு ஒப்பந்தங்கள், ஆவணங்கள், காவல் புகார் அல்லது நீதிமன்ற உத்தரவுகளைப் பதிவேற்றி SHA-256 முத்திரையைப் பெறலாம் (PDF, JPG, PNG, அதிகபட்சம் 15MB).
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const { validatePropertyEvidenceFile } = await import("../lib/security");
              const result = await validatePropertyEvidenceFile(file);
              if (!result.isValid) {
                alert(`பாதுகாப்பு எச்சரிக்கை: ${result.securityMessage}`);
              } else {
                alert(`ஆவணம் சரிபார்க்கப்பட்டது!\nSHA-256 Hash: ${result.sha256Hash}\nஅளவு: ${result.fileSizeFormatted}\nஅமைப்பு: ${result.securityMessage}`);
              }
            }}
            className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-900 hover:file:bg-purple-200 cursor-pointer"
          />
        </div>

        {/* Action Footer & Limit Warning */}
        {currentCaseCount >= maxCases && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold">
              <Lock className="h-5 w-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-black text-amber-950">இலவசக் கணக்கு வரம்பு எட்டப்பட்டது ({currentCaseCount}/{maxCases} வழக்குகள்)</p>
                <p className="text-[11px] text-amber-800 font-medium">புதிய வழக்குகளை பகுப்பாய்வு செய்ய வெள்ளி அல்லது தங்கத் திட்டத்திற்கு உயர்த்தவும்.</p>
              </div>
            </div>
            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider rounded-lg text-[11px] shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>திட்டத்தை உயர்த்துக</span>
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer flex items-center gap-2 shadow-xs ${
              currentCaseCount >= maxCases
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-purple-700 hover:bg-purple-800 text-white font-black disabled:bg-slate-200 disabled:text-slate-400"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>UNIKORN360 மூலம் 10-நிலை பகுப்பாய்வு செய்யப்படுகிறது...</span>
              </>
            ) : currentCaseCount >= maxCases ? (
              <>
                <Lock className="h-4 w-4" />
                <span>வரம்பு எட்டப்பட்டது - திட்டத்தை உயர்த்தவும்</span>
              </>
            ) : (
              <>
                <span>10-நிலை சட்டப் பகுப்பாய்வை உருவாக்கு</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
