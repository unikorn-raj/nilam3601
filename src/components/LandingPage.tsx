import React, { useState } from "react";
import { 
  Scale, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Zap, Crown, Lock, 
  FileText, Landmark, Search, ShieldAlert, Check, HelpCircle, ChevronDown, 
  ChevronUp, Award, Layers, Globe, Smartphone, User, Star, ArrowUpRight,
  Gavel, Building2, Shield, HeartHandshake, Briefcase, Receipt, HardHat,
  Cpu, Terminal, Compass, ChevronRight, Layers3
} from "lucide-react";
import { PLAN_CONFIGS, ALL_PLANS } from "../data/pricingMaster";
import { PlanType } from "../types";
import { UnikornLogo } from "./UnikornLogo";
import { useLanguage, LanguageSelectorButton } from "../lib/languageContext";
import { PWAInstallButton } from "./PWAInstallButton";

interface LandingPageProps {
  onLogin: (options?: { useRedirect?: boolean }) => void;
  isLoading: boolean;
}

export function LandingPage({ onLogin, isLoading }: LandingPageProps) {
  const { t } = useLanguage();
  const [previewDomain, setPreviewDomain] = useState<"property" | "legal">("property");
  const [activeTab, setActiveTab] = useState<"stage" | "draft" | "rag" | "summary">("stage");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Ecosystem Badge */}
          <div className="flex items-center gap-3">
            <UnikornLogo size="lg" showText={true} />
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-black uppercase tracking-wider">
              <Cpu className="h-3 w-3 text-indigo-400" />
              AIEOS OS v2.0
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#domains" className="hover:text-amber-400 transition flex items-center gap-1">
              <span>{t("வொர்க்பேஸ்கள்", "Workspaces")}</span>
            </a>
            <a href="#resolution-framework" className="hover:text-amber-400 transition">
              {t("AI தீர்வு கட்டமைப்பு", "Case Resolution")}
            </a>
            <a href="#pricing" className="hover:text-amber-400 transition">
              {t("கட்டணம்", "Pricing")}
            </a>
            <a href="#roadmap" className="hover:text-amber-400 transition">
              {t("AIEOS சிஸ்டம்", "Roadmap")}
            </a>
            <a href="#faq" className="hover:text-amber-400 transition">
              {t("கேள்விகள்", "FAQ")}
            </a>
          </div>

          {/* Right Language Selector, PWA Install & Login Button */}
          <div className="flex items-center gap-3">
            <PWAInstallButton variant="header" />
            <LanguageSelectorButton variant="dark" />

            <button
              type="button"
              onClick={() => onLogin()}
              disabled={isLoading}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all duration-200 cursor-pointer flex items-center gap-2 border border-indigo-400/30 active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("உள்நுழைகிறது...", "Signing in...")}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                  <span>{t("கூகுள் மூலம் உள்நுழை", "Sign In with Google")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>


      {/* 2. HERO SECTION */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Background Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill - Citizen360 Platform */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/40 text-xs font-bold text-indigo-300 shadow-xl mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-amber-400 font-black">CITIZEN360</span>
            <span className="text-slate-500">•</span>
            <span>AI-Powered Legal & Property Resolution Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
            ஒரே AI பிளாட்ஃபார்ம். <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-indigo-300 bg-clip-text text-transparent">
              அனைத்து சட்ட & சொத்துப் பிரச்சனைகளுக்கும் உடனடித் தீர்வு.
            </span>
          </h1>

          {/* Subtitle listing all core legal domains */}
          <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 font-medium max-w-4xl mx-auto leading-relaxed">
            பூர்வீகச் சொத்துத் தகராறுகள் • நில வருவாய் முரண்பாடுகள் • குற்றவியல் (Criminal) • குடும்ப விவகாரங்கள் (Family) • நுகர்வோர் புகார்கள் (Consumer) • தொழிலாளர் உரிமைகள் (Labour) • வரி நோட்டீஸ்கள் (Tax) • சைபர் மோசடி (Cyber Fraud) — <strong className="text-amber-300 font-bold">அனைத்தும் AI தொழில்நுட்பம் மூலம் நிமிடங்களில் பகுப்பாய்வு செய்யப்படும்.</strong>
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onLogin()}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-amber-300/50 hover:scale-[1.02] active:scale-95"
            >
              <Zap className="h-5 w-5 fill-current text-slate-950" />
              <span>இலவசமாகத் தொடங்குங்கள் (2 Cases Free)</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <a
              href="#domains"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-bold text-sm uppercase tracking-wider border border-slate-800 transition-all duration-200 flex items-center justify-center gap-2 hover:border-indigo-500/50"
            >
              <span>வொர்க்பேஸ்களைப் பார் (View Workspaces)</span>
            </a>
          </div>

          {/* Key Value Guarantee Bullets */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-extrabold text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>2 வழக்குகள் எப்போதும் இலவசம்</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Property360 + Legal360 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>இருமொழி சட்ட மனு & நோட்டீஸ் வரைவு</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. WORKSPACE DOMAIN CARDS (PROPERTY360 & LEGAL360) */}
      <section id="domains" className="py-12 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-black uppercase tracking-wider">
              CITIZEN360 AI WORKSPACES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              இரண்டு முதன்மை வொர்க்பேஸ்கள் • 12 சிறப்பு AI எஞ்சின்கள்
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
              சொத்து விவகாரம் அல்லது சட்டப் பிரச்சனை எதுவாக இருந்தாலும், அதற்கான சிறப்பு AI எஞ்சின் தயார்.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            
            {/* PROPERTY360 CARD */}
            <div className="p-6 rounded-3xl bg-slate-950/90 border-2 border-amber-500/60 hover:border-amber-400 transition-all shadow-xl shadow-amber-950/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
                      <Landmark className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">PROPERTY360</h3>
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">நிலம் & சொத்துத் தீர்வுகள்</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase rounded-lg">
                    4 Modules
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-5">
                  தமிழ்நாடு நில வருவாய் சட்டம், UTR பிழைகள், பட்டா மாற்றம், போலிப் பதிவுகள் மற்றும் நில அளவை முரண்பாடுகளுக்கான 10-கட்ட AI தணிக்கை.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { title: "Registration", desc: "பத்திரப் பதிவு & 68/77A ரத்து" },
                    { title: "Revenue", desc: "பட்டா / சிட்டா / UTR பிழைகள்" },
                    { title: "Property", desc: "பூர்வீகப் பாகப்பிரிவினை & வாரிசுரிமை" },
                    { title: "Survey", desc: "தாலுகா புலத்தணிக்கை வரைபடம்" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs font-black text-amber-300 block">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>10-Stage Land Revenue Audit Engine</span>
                <span className="text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1">
                  <span>Explore</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>

            {/* LEGAL360 CARD */}
            <div className="p-6 rounded-3xl bg-slate-950/90 border-2 border-indigo-500/60 hover:border-indigo-400 transition-all shadow-xl shadow-indigo-950/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/40 text-indigo-400">
                      <Scale className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">LEGAL360</h3>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">சட்டத் தகராறு & தீர்ப்புகள்</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-400/10 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase rounded-lg">
                    8 Legal Domains
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-5">
                  குற்றவியல், குடும்ப வழக்குகள், நுகர்வோர் உரிமைகள், தொழிலாளர் சட்டம், வரி நோட்டீஸ்கள் மற்றும் சைபர் மோசடிகளுக்கான 12-கட்ட AI தீர்வு எஞ்சின்.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { title: "Criminal360", desc: "FIR & பிணை மனு" },
                    { title: "Family360", desc: "ஜீவனாம்சம் & வாரிசு" },
                    { title: "Consumer360", desc: "நஷ்டஈடு & ரீஃபண்ட்" },
                    { title: "Labour360", desc: "பணிநீக்கம் & பி.எஃப்" },
                    { title: "Tax360", desc: "GST & IT நோட்டீஸ்" },
                    { title: "Corporate360", desc: "ஒப்பந்த மீறல்" },
                    { title: "Cyber360", desc: "நிதி மோசடி புகார்கள்" },
                    { title: "Constitution360", desc: "ரீட் மனுக்கள் (Writ)" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-[11px] font-black text-indigo-300 block truncate">{item.title}</span>
                      <span className="text-[9.5px] text-slate-400 font-medium line-clamp-1">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>12-Stage Legal Case Solution Engine</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-1">
                  <span>Explore</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT PREVIEW SHOWCASE (PROPERTY360 VS LEGAL360) */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-wider">
              நேரலை AI மாதிரிக் காட்சி (Interactive Showcase)
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              Citizen360 எவ்வாறு இயங்குகிறது என்று பாருங்கள்
            </h2>
          </div>

          <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-3 sm:p-5 shadow-2xl shadow-indigo-950/50 text-left relative">
            
            {/* Top Mac Window Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  unikorn360.ai/app/{previewDomain === "property" ? "property360_patta_audit" : "legal360_consumer_compensation"}
                </span>
              </div>

              {/* DOMAIN SWITCH BUTTONS */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDomain("property")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                    previewDomain === "property"
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Landmark className="h-3.5 w-3.5" />
                  <span>PROPERTY360</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDomain("legal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                    previewDomain === "legal"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>LEGAL360 (Consumer / Criminal)</span>
                </button>
              </div>
            </div>

            {/* Showcase Tab Nav */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800/80 pb-3">
              {[
                { id: "stage", label: previewDomain === "property" ? "10-கட்ட நில தணிக்கை" : "12-கட்ட நுகர்வோர்/சட்ட தீர்வு", icon: Layers },
                { id: "draft", label: previewDomain === "property" ? "வட்டாட்சியர் ஆட்சேபனை வரைவு" : "நுகர்வோர் ஆணையப் புகார் / சட்ட நோட்டீஸ்", icon: FileText },
                { id: "rag", label: previewDomain === "property" ? "வருவாய் அரசாணைகள் (RSO)" : "உச்ச நீதிமன்ற & NCDRC தீர்ப்புகள்", icon: Search },
                { id: "summary", label: "வாடிக்கையாளர் அறிக்கை (Client Summary)", icon: Globe }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isActive 
                        ? previewDomain === "property" ? "bg-amber-400 text-slate-950 shadow-md font-black" : "bg-indigo-600 text-white shadow-md font-black"
                        : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Showcase Content Panel */}
            <div className="bg-slate-950 rounded-2xl p-5 sm:p-7 border border-slate-800/80">
              
              {/* PROPERTY PREVIEWS */}
              {previewDomain === "property" && (
                <>
                  {activeTab === "stage" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">PROPERTY360 • வழக்கு எண்: TN-MDU-2026-089</span>
                          <h3 className="text-base font-black text-white mt-0.5">மதுரை பூர்வீக சொத்து பத்திரம் போலிப்பதிவு & பட்டா மாற்றம் ஆட்சேபனை</h3>
                          <p className="text-xs text-slate-400 font-medium mt-1">சர்வே எண்: 142/3B • மேலூர் தாலுகா, மதுரை மாவட்டம்</p>
                        </div>
                        <div className="px-4 py-2 bg-rose-950/80 border border-rose-800/80 rounded-xl text-center shrink-0">
                          <span className="text-[10px] font-black text-rose-300 uppercase block">ஆபத்து மதிப்பீடு (Risk Score)</span>
                          <span className="text-xl font-black text-rose-400">82 / 100 • அதிதீவிர ஆபத்து</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
                            <Landmark className="h-4 w-4" />
                            <span>அதிகார வரம்பு (Stage 3 Jurisdiction)</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            மேலூர் வட்டாட்சியர் & கிராம நிர்வாக அலுவலர் (VAO) • மாவட்ட பதிவாளர் (ஆட்சேபனை தடுப்பு)
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase">
                            <ShieldAlert className="h-4 w-4" />
                            <span>சட்டப்பிரிவு (Stage 4 Statutory Law)</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            தமிழ்நாடு நில வருவாய் சட்டம் & பதிவுத் துறை சட்டப்பிரிவு 68/77A (போலிப் பதிவு ரத்து)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "draft" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider">வட்டாட்சியருக்கு அனுப்புவதற்கான மாதிரி ஆட்சேபனை மனு</span>
                        <span className="text-[10px] font-mono text-slate-400">உடனடி தமிழ் வரைவு</span>
                      </div>
                      <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
{`பெறுநர்:
உயர்திரு வட்டாட்சியர் அவர்கள்,
மேலூர் தாலுகா, மதுரை மாவட்டம்.

பொருள்: சர்வே எண் 142/3B நிலத்திற்கு தவறான செட்டில்மென்ட் பத்திரம் அடிப்படையில் பட்டா மாற்றம் செய்ய இடைக்காலத் தடை கோருதல் - ஆட்சேபனை மனு.

மனுதாரர்: ரமேஷ் குமார், த/பெ மறைந்த கிருஷ்ணசாமி, மேலூர் கிராமம்.

அய்யா,
எனது மறைந்த தந்தை கிருஷ்ணசாமி அவர்களின் வாரிசுகளில் நானும் ஒருவன். எனது மூத்த சகோதரர் எங்களது பூர்வீக நிலத்திற்கு எனது அனுமதியின்றி போலிச் செட்டில்மென்ட் பத்திரம் பதிவு செய்து பட்டா உட்பிரிவிற்கு விண்ணப்பித்துள்ளார். எனவே வருவாய் தணிக்கை மற்றும் புலத்தணிக்கை முடியும் வரை பட்டா மாற்றம் செய்யக்கூடாது என தாழ்மையுடன் கேட்டுக்கொள்கிறேன்.`}
                      </pre>
                    </div>
                  )}

                  {activeTab === "rag" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2">
                        <span className="text-xs font-black text-amber-300 uppercase">தமிழ்நாடு வருவாய் அரசாணைகள் (Revenue Standing Orders - RSO)</span>
                        <p className="text-xs text-slate-300">
                          RSO 31 - பட்டா மாற்றம் மற்றும் வாரிசுதாரர் முரண்பாடு விசாரணை விதிகள்:
                          "சொத்து வாரிசுரிமை விவகாரங்களில் அனைத்து வாரிசுகளின் ஒப்புதல் சான்றிதழ் இன்றி வட்டாட்சியர் தனிநபர் பெயருக்கு உட்பிரிவு செய்யக்கூடாது."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "summary" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase">பிரச்சனை கண்டறிதல்</span>
                          <p className="text-xs text-slate-200 font-bold mt-1">பூர்வீகச் சொத்தில் அனுமதியற்ற போலிப் பத்திரம் மாற்றம்</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase">எதிர்பார்க்கப்படும் காலக்கெடு</span>
                          <p className="text-xs text-emerald-400 font-bold mt-1">15 - 30 நாட்கள் (வருவாய் வட்டாட்சியர் விசாரணை)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* LEGAL PREVIEWS */}
              {previewDomain === "legal" && (
                <>
                  {activeTab === "stage" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">CONSUMER360 • வழக்கு எண்: TN-CHE-2026-C04</span>
                          <h3 className="text-base font-black text-white mt-0.5">மருத்துவக் காப்பீட்டுத் தொகை நிராகரிப்பு & 4.5 லட்சம் நஷ்டஈடு கோரிக்கை</h3>
                          <p className="text-xs text-slate-400 font-medium mt-1">எதிர்தரப்பு: ஸ்டார் ஹெல்த் இன்சூரன்ஸ் நிறுவனம் • சென்னை மாவட்ட நுகர்வோர் ஆணையம்</p>
                        </div>
                        <div className="px-4 py-2 bg-amber-950/80 border border-amber-800/80 rounded-xl text-center shrink-0">
                          <span className="text-[10px] font-black text-amber-300 uppercase block">நஷ்டஈடு மதிப்பீடு (Claim Value)</span>
                          <span className="text-xl font-black text-amber-400">ரூ. 4,50,000 + வட்டி</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase">
                            <Scale className="h-4 w-4" />
                            <span>நுகர்வோர் சட்டம் (Stage 5 Violation under CPA 2019)</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            Deficiency of Service & Unfair Trade Practice (சேவை குறைபாடு மற்றும் தவறான நிராகரிப்பு)
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
                            <Landmark className="h-4 w-4" />
                            <span>முறையான நுகர்வோர் ஆணையம் (Stage 7 Forum)</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            மாவட்ட நுகர்வோர் குறைதீர் ஆணையம் (District Consumer Commission, Chennai South)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "draft" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">காப்பீட்டு நிறுவனத்திற்கு அனுப்பப்படும் சட்ட நோட்டீஸ் (Formal Legal Notice)</span>
                        <span className="text-[10px] font-mono text-slate-400">CPA 2019 Compliant</span>
                      </div>
                      <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
{`BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE / LEGAL NOTICE

TO: THE MANAGING DIRECTOR & CLAIMS OFFICER,
FAMILY HEALTH INSURANCE CO. LTD., CHENNAI.

SUBJECT: LEGAL NOTICE FOR UNJUSTIFIED REJECTION OF MEDICAL CLAIM NO. CLM-88901 & DEMAND FOR RS. 4,50,000/- ALONG WITH 18% INTEREST AND RS. 1,00,000 MENTAL AGONY COMPENSATION.

Sir/Madam,
Under instructions from my client Shri Saravanan Velu, I hereby issue this Legal Notice. My client has maintained a valid Health Insurance Policy for 10 years without break. On 14-05-2026, my client's father underwent emergency cardiac surgery. Despite submitting original bills and hospital medical certificates confirming a fresh onset, your company repudiated the claim on arbitrary grounds of 'Pre-existing Condition'.

Take Notice that unless the sum of Rs. 4,50,000/- is disbursed within 15 days, my client shall institute formal proceedings before the District Consumer Disputes Redressal Commission under Section 35 of the Consumer Protection Act, 2019.`}
                      </pre>
                    </div>
                  )}

                  {activeTab === "rag" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-2">
                        <span className="text-xs font-black text-indigo-300 uppercase">உச்ச நீதிமன்றம் & NCDRC தீர்ப்புகள் (Consumer Precedents)</span>
                        <p className="text-xs text-slate-300">
                          Supreme Court Precedent - Manmohan Nanda vs United India Insurance Co (2022):
                          "Once an insurer accepts a policy without medical examination, it cannot repudiate claims based on general pre-existing condition allegations without concrete expert evidence."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "summary" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase">சிறந்த முடிவு (Best Case Outcome)</span>
                          <p className="text-xs text-emerald-400 font-bold mt-1">முழு மருத்துவ தொகையும் + ரூ. 50,000 மன உளைச்சல் நஷ்டஈடு மீட்பு</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase">அடுத்த 7 நாட்கள் நடவடிக்கை</span>
                          <p className="text-xs text-indigo-300 font-bold mt-1">15 நாள் கெடுடன் கூடிய வழக்கறிஞர் நோட்டீஸ் உடனடியாக அனுப்புதல்</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 7. PRICING TIERS SECTION */}
      <section id="pricing" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
              சேவை திட்டங்கள் & கட்டணங்கள்
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-4">
              உங்கள் தேவைக்கேற்ற வெளிப்படையான கட்டணத் திட்டங்கள்
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-3">
              எவ்வித மறைமுகக் கட்டணமுமின்றி 2 வழக்குகளை (Property360 அல்லது Legal360) முற்றிலும் இலவசமாகச் சோதிக்கலாம்.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {ALL_PLANS.map((plan) => {
              const planKey = plan.id;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 relative ${
                    isPopular
                      ? "bg-gradient-to-b from-indigo-950/90 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-900/40"
                      : "bg-slate-900/80 border border-slate-800"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                      ★ மிகவும் பிரபலம் ★
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-white text-lg">{plan.nameTamil}</h3>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">
                        {plan.badge}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{plan.priceTamil}</span>
                        <span className="text-xs font-bold text-slate-400">{plan.periodTamil}</span>
                      </div>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-bold">
                        {plan.caseLimitText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium border-t border-slate-800/80 pt-4 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                      <p className="text-[10px] font-black uppercase text-slate-400">உள்ளடங்கிய வசதிகள்:</p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="button"
                      onClick={() => onLogin()}
                      disabled={isLoading}
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition duration-150 cursor-pointer flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                      }`}
                    >
                      <span>கூகுள் மூலம் தொடங்குக</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)</h2>
            <p className="text-xs text-slate-400 font-medium mt-2">Citizen360 AI பயன்பாடு குறித்த சந்தேகங்கள்</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "இலவசக் கணக்கில் எத்தனை வழக்குகளைப் பகுப்பாய்வு செய்யலாம்?",
                a: "ஒவ்வொரு பயனரும் முற்றிலும் இலவசமாக 2 சொத்து அல்லது சட்ட வழக்குகளை (Property360 / Legal360) AI தணிக்கை செய்து பயன்பெறலாம்."
              },
              {
                q: "Citizen360 பிளாட்ஃபார்மில் என்னென்ன சட்ட விவகாரங்களை பகுப்பாய்வு செய்யலாம்?",
                a: "சொத்துத் தகராறுகள் (Property360), நில வருவாய் முரண்பாடுகள், குற்றவியல் (Criminal360), குடும்ப வழக்குகள் (Family360), நுகர்வோர் புகார்கள் (Consumer360), தொழிலாளர் உரிமைகள் (Labour360), வரி நோட்டீஸ்கள் (Tax360), கார்ப்பரேட் சட்டம் மற்றும் சைபர் மோசடிகள் அனைத்தையும் பகுப்பாய்வு செய்யலாம்."
              },
              {
                q: "ஏன் கூகுள் கணக்கு மூலம் உள்நுழைவது அவசியமாகிறது?",
                a: "உங்கள் வழக்குக் கோப்புகள் மற்றும் சட்ட மனு வரைவுகள் சூப்பாதேஸ் (Supabase Cloud) மேகக்கணினியில் பாதுகாப்பாகச் சேமிக்கப்படவும், நீங்கள் மட்டுமே அணுகவும் உள்நுழைவு கட்டாயமாக்கப்பட்டுள்ளது."
              },
              {
                q: "மனு வரைவுகளை அச்சிடவோ அல்லது வாட்ஸ்அப்பில் அனுப்பவோ முடியுமா?",
                a: "ஆம், உருவாக்கப்படும் மனு வரைவுகள் மற்றும் சட்ட நோட்டீஸ்களை ஒரே கிளிக்கில் PDF ஆக பதிவிறக்கம் செய்யவோ அல்லது வாட்ஸ்அப் / மின்னஞ்சல் மூலமாக அனுப்பவோ முடியும்."
              }
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left font-black text-sm text-slate-200 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-amber-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 font-medium leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            இன்றே உங்கள் சட்ட & சொத்து கோப்பை பகுப்பாய்வு செய்யுங்கள்
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-3 max-w-xl mx-auto">
            கூகுள் கணக்கு மூலம் 10 வினாடிகளில் உள்நுழைந்து 2 வழக்கு இலவச AI பகுப்பாய்வைப் பெறுங்கள்.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => onLogin()}
              disabled={isLoading}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-400/20 transition cursor-pointer flex items-center gap-3 border border-amber-300"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>இலவசமாக உள்நுழைக (Sign In Free)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-mono font-bold text-slate-400">
            <UnikornLogo size="sm" showText={false} />
            <span>CITIZEN360 © 2026 • Powered by <strong className="text-indigo-400">AIEOS</strong> & <strong className="text-amber-300">UNIKORN360 AI SOLUTIONS</strong></span>
          </div>
          <p className="text-[10px] text-slate-500 max-w-md">
            Citizen360 (Property360 + Legal360) is an AI-powered legal & land revenue resolution platform, proudly built on AIEOS by Unikorn360 AI Solutions.
          </p>
        </div>
      </footer>

    </div>
  );
}
