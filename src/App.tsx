import React, { useState, useEffect } from "react";
import { IntakeData, PropertyCase, PlanType } from "./types";
import { IntakeForm } from "./components/IntakeForm";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { ClientReplyPanel } from "./components/ClientReplyPanel";
import { DocumentDraftPanel } from "./components/DocumentDraftPanel";
import { PrecedentAndStrategyPanel } from "./components/PrecedentAndStrategyPanel";
import { StatWidgets } from "./components/StatWidgets";
import { SupabaseRAGExplorer } from "./components/SupabaseRAGExplorer";
import { PricingModal } from "./components/PricingModal";
import { PLAN_CONFIGS, getPlanConfig } from "./data/pricingMaster";
import { AndroidApkModal } from "./components/AndroidApkModal";
import { GuidelineCalculatorModal } from "./components/GuidelineCalculatorModal";
import { RevenueAppealsTrackerModal } from "./components/RevenueAppealsTrackerModal";
import { SuperAdminModal } from "./components/SuperAdminModal";
import { LandingPage } from "./components/LandingPage";
import { UnikornLogo } from "./components/UnikornLogo";
import { useLanguage, LanguageSelectorButton } from "./lib/languageContext";
import { downloadDocumentAsPDF } from "./lib/pdfExport";

import { 
  Scale, FileText, CheckCircle, AlertTriangle, ArrowRight, Plus, 
  Search, Trash2, Home, Sparkles, ShieldCheck, Download, Printer, 
  ChevronRight, ArrowLeft, Layers, Landmark, Briefcase, RefreshCw,
  Clock, Database, Lock, AlertCircle, ExternalLink, FolderPlus,
  User, LogOut, Settings, ChevronDown, Mail, Shield, HardDrive, UserCheck, X, Zap, Crown,
  Smartphone, Calculator, Hourglass, ShieldAlert
} from "lucide-react";
import {
  signInWithGoogle,
  logoutUser,
  subscribeToAuthChanges,
  syncCaseToCloud,
  fetchCloudCases,
  deleteCloudCase,
  saveOrUpdateUserProfile,
  isFirebaseMockEnabled
} from "./lib/firebase";

export default function App() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<PropertyCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "brief" | "draft">("analysis");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isRAGExplorerActive, setIsRAGExplorerActive] = useState(false);
  const [caseToDeleteId, setCaseToDeleteId] = useState<string | null>(null);

  // New Features Modals State
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [isAppealsModalOpen, setIsAppealsModalOpen] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  // Pricing & Subscription Plan State
  const [userPlan, setUserPlan] = useState<PlanType>(() => {
    try {
      const saved = localStorage.getItem("unikorn360_user_plan");
      return (saved as PlanType) || "free";
    } catch {
      return "free";
    }
  });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLimitNotice, setIsLimitNotice] = useState(false);

  const handleSelectPlan = (newPlan: PlanType) => {
    setUserPlan(newPlan);
    try {
      localStorage.setItem("unikorn360_user_plan", newPlan);
    } catch (e) {
      console.error("Failed to save plan state:", e);
    }
    setIsPricingModalOpen(false);
    setIsLimitNotice(false);
  };

  const currentPlanConfig = getPlanConfig(userPlan);
  const maxCases = currentPlanConfig.maxCases;

  // Authentication State
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Subscribe to Authentication Changes & Sync User Profile
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (u) => {
      setUser(u);
      setIsAuthLoading(false);

      if (u && u.email) {
        try {
          const profile = await saveOrUpdateUserProfile({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || undefined,
            photoURL: u.photoURL || undefined
          }, userPlan);
          
          if (profile && profile.plan) {
            setUserPlan(profile.plan);
            try {
              localStorage.setItem("unikorn360_user_plan", profile.plan);
            } catch (e) {
              console.error("Failed to sync plan state:", e);
            }
          }
        } catch (err) {
          console.error("Failed to sync user profile on auth change:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [userPlan]);

  // Sync / Load Cases isolated strictly by user auth status
  useEffect(() => {
    setSelectedCaseId(null);
    setIsCreatingNew(false);
    
    if (user) {
      setIsAuthLoading(true);
      fetchCloudCases(user.uid)
        .then((cloudCases) => {
          const userCases = Array.isArray(cloudCases) ? cloudCases : [];
          setCases(userCases);
          try {
            localStorage.setItem(`unikorn360_cases_${user.uid}`, JSON.stringify(userCases));
          } catch (e) {
            console.error("Local save error:", e);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch cloud cases:", err);
          setCases([]);
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    } else {
      setCases([]);
    }
  }, [user]);

  // Save cases locally and to user storage key
  const saveCases = (updatedCases: PropertyCase[]) => {
    setCases(updatedCases);
    if (user) {
      const key = `unikorn360_cases_${user.uid}`;
      try {
        localStorage.setItem(key, JSON.stringify(updatedCases));
      } catch (e) {
        console.error("Local storage write error:", e);
      }
    }
  };

  const handleGoogleLogin = async (options?: { useRedirect?: boolean }) => {
    setLoginError(null);
    try {
      setIsAuthLoading(true);
      const resUser = await signInWithGoogle(options);
      if (resUser && resUser.email) {
        try {
          const profile = await saveOrUpdateUserProfile({
            uid: resUser.uid,
            email: resUser.email,
            displayName: resUser.displayName || undefined,
            photoURL: resUser.photoURL || undefined
          }, userPlan);
          if (profile && profile.plan) {
            setUserPlan(profile.plan);
          }
        } catch (profileErr) {
          console.error("User profile sync error on google login:", profileErr);
        }
      }
      setIsLoginModalOpen(false);
    } catch (err: any) {
      console.error("Login failed:", err);
      const isInIframe = typeof window !== "undefined" && window.self !== window.top;
      if (isInIframe) {
        setLoginError(
          "கூகுள் பாதுகாப்பு விதிமுறைகளின் காரணமாக, இந்த மாதிரிக்காட்சி சட்டகத்திற்குள் (iframe) பாப்-அப் நேரடியாக திறக்கப்படாது. தயவுசெய்து 'தனிமைப்படுத்தப்பட்ட காட்சியில் திறக்கவும்' (Isolated Display) பொத்தானை அழுத்தி புதிய தாவலில் திறந்து கூகுள் கணக்கில் உள்நுழையவும்."
        );
      } else {
        setLoginError(
          `உள்நுழைவு தோல்வியடைந்தது: ${err?.message || "உலாவியின் பாப்-அப் தடையை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."}`
        );
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateCase = async (intake: IntakeData, rawDescription: string) => {
    if (cases.length >= maxCases) {
      setIsLimitNotice(true);
      setIsPricingModalOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setErrorText(null);
    try {
      let authToken = "";
      if (user) {
        try {
          authToken = await user.getIdToken();
        } catch (e) {
          console.warn("Failed to obtain Auth ID Token:", e);
        }
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ intake, rawDescription })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "The Unikorn360 engine returned an unexpected error.");
      }

      const analyzedData = await response.json();
      
      const newCase: PropertyCase = {
        ...analyzedData,
        id: "case_" + Date.now(),
        createdAt: new Date().toISOString(),
        rawDescription,
        history: [
          {
            id: "hist_init_" + Date.now(),
            timestamp: new Date().toISOString(),
            description: "Case folder created from raw client dispute intake."
          }
        ]
      };

      const updated = [newCase, ...cases];
      
      // Sync with Firebase Cloud Firestore if user is signed in
      if (user) {
        try {
          await syncCaseToCloud(user.uid, newCase);
        } catch (err) {
          console.error("Failed to sync new case to cloud:", err);
        }
      }
      
      saveCases(updated);
      setSelectedCaseId(newCase.id);
      setIsCreatingNew(false);
      setActiveTab("analysis");
    } catch (err: any) {
      console.error("Case creation failed:", err);
      setErrorText(err.message || "Failed to analyze the dispute. Please verify the backend connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateCase = async (updatedCase: PropertyCase, historyDesc?: string) => {
    let finalCase = { ...updatedCase };
    if (historyDesc) {
      const newEntry = {
        id: "hist_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        description: historyDesc
      };
      finalCase.history = [newEntry, ...(finalCase.history || [])];
    }
    const updated = cases.map(c => c.id === finalCase.id ? finalCase : c);
    
    // Sync with Firebase Cloud Firestore if user is signed in
    if (user) {
      try {
        await syncCaseToCloud(user.uid, finalCase);
      } catch (err) {
        console.error("Failed to sync updated case to cloud:", err);
      }
    }
    
    saveCases(updated);
  };

  const confirmDeleteCase = async (id: string) => {
    const updated = cases.filter(c => c.id !== id);
    
    // Sync with Firebase Cloud Firestore if user is signed in
    if (user) {
      try {
        await deleteCloudCase(user.uid, id);
      } catch (err) {
        console.error("Failed to delete case from cloud:", err);
      }
    }
    
    saveCases(updated);
    if (selectedCaseId === id) {
      setSelectedCaseId(null);
    }
    setCaseToDeleteId(null);
  };

  const handleUpdateDraft = (newTitle: string, newContent: string, historyDesc?: string) => {
    if (!selectedCaseId) return;
    const activeCase = cases.find(c => c.id === selectedCaseId);
    if (!activeCase) return;

    const updatedCase: PropertyCase = {
      ...activeCase,
      customDocumentDraft: {
        documentTitle: newTitle,
        documentContent: newContent
      }
    };
    handleUpdateCase(updatedCase, historyDesc);
  };

  const [isDownloadingGlobalPDF, setIsDownloadingGlobalPDF] = useState(false);

  const handleGlobalPDFDownload = async () => {
    if (!selectedCase) return;
    setIsDownloadingGlobalPDF(true);
    try {
      const caseTitle = selectedCase.intake?.clientName
        ? `${selectedCase.intake.clientName} - ${selectedCase.stage1?.category || "சட்ட வழக்கு"}`
        : selectedCase.stage1?.category || "சொத்து சட்ட வரைவு & ஆய்வறிக்கை";

      let docTitle = caseTitle;
      let docContent = "";

      if (activeTab === "draft") {
        docTitle = selectedCase.customDocumentDraft?.documentTitle || caseTitle;
        docContent = selectedCase.customDocumentDraft?.documentContent || "வரைவு உள்ளடக்கங்கள் இல்லை.";
      } else if (activeTab === "brief") {
        docTitle = `வாடிக்கையாளர் தகவல் கையேடு (Client Brief) - ${caseTitle}`;
        docContent = `
வழக்கு மனுதாரர்: ${selectedCase.intake?.clientName || "N/A"}
எதிர்மனுதாரர்: ${selectedCase.intake?.oppositeParty || "N/A"}
மாவட்டம்: ${selectedCase.intake?.district || "N/A"} | கிராமம்/சர்வே எண்: ${selectedCase.intake?.village || "N/A"} / ${selectedCase.intake?.surveyNumber || "N/A"}

கண்டறியப்பட்ட பிரச்சனை:
${selectedCase.clientFacingReply?.problemIdentified || "N/A"}

சட்ட ரீதியான நிலைப்பாடுகள்:
${selectedCase.clientFacingReply?.legalPosition || "N/A"}

உடனடி அடுத்த கட்ட நடவடிக்கை:
${selectedCase.clientFacingReply?.immediateNextStep || "N/A"}

எதிர்பார்க்கப்படும் கால அளவு:
${selectedCase.clientFacingReply?.estimatedTimeline || "N/A"}

தேவைப்படும் முக்கிய ஆவணங்கள்:
${selectedCase.documentsRequired?.mandatory?.join("\n") || "N/A"}

24 மணிநேர அவசர நடவடிக்கை:
${selectedCase.immediateAction?.within24Hours?.join("\n") || "N/A"}
        `.trim();
      } else {
        docTitle = `சட்ட ஆய்வறிக்கை (Legal Analysis) - ${caseTitle}`;
        docContent = `
வழக்கு வகை: ${selectedCase.stage1?.category || "N/A"} (${selectedCase.stage1?.specificType || ""})
முக்கிய பிரச்சனை சுருக்கம்: ${selectedCase.stage2?.realIssue || selectedCase.rawDescription || "N/A"}

ஆபத்து நிலை (Risk Rating): ${selectedCase.stage9?.rating || "மத்திய நிலை"} (மதிப்பெண்: ${selectedCase.stage9?.score || 0}/100)
முதன்மை தீர்வு முறை: ${selectedCase.stage8?.primaryRemedy || "N/A"}

உடனடி 24 மணிநேர நடவடிக்கைகள்:
${selectedCase.immediateAction?.within24Hours?.map(a => `• ${a}`).join("\n") || "N/A"}

தேவையான முக்கிய சான்றுகள் & ஆவணங்கள்:
${selectedCase.stage6?.available?.map(d => `✓ ${d}`).join("\n") || "N/A"}
        `.trim();
      }

      let reportType = "LEGAL INTELLIGENCE REPORT";
      let docType = selectedCase.stage1?.category || "Police / Legal Representation";
      let domain = "Property Law (Property360 Intelligence)";

      if (activeTab === "draft") {
        reportType = "AI LEGAL DRAFT";
        docType = selectedCase.stage1?.category ? `${selectedCase.stage1.category} / Petition` : "Representation Draft";
      } else if (activeTab === "brief") {
        reportType = "CLIENT BRIEF & ADVISORY";
        docType = "Client Executive Brief";
      } else {
        reportType = "LEGAL INTELLIGENCE ANALYSIS";
        docType = "Case Strategy & Risk Report";
      }

      await downloadDocumentAsPDF({
        title: docTitle,
        reportType,
        docType,
        domain,
        caseId: `UK360-${String(selectedCase.id).toUpperCase().slice(-6)}`,
        status: "AI Draft | Advocate Review Recommended",
        content: docContent,
        sealHash: selectedCase.customDocumentDraft?.sha256Hash,
        filename: `${docTitle}_${selectedCase.id}`
      });
    } catch (err) {
      console.error("Global PDF download error:", err);
    } finally {
      setIsDownloadingGlobalPDF(false);
    }
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Filter cases based on search and category filters
  const filteredCases = cases.filter(c => {
    const matchSearch = 
      c.stage0?.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stage0?.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stage0?.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stage2?.rootCauseStatement?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCategory = 
      categoryFilter === "All" || 
      c.stage1?.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  if (!user) {
    return (
      <LandingPage
        onLogin={handleGoogleLogin}
        isLoading={isAuthLoading}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 antialiased bg-[#F8FAFC] selection:bg-purple-600 selection:text-white">
      
      {/* 1. Professional Office Header with Deep Purple & Clean Slate aesthetic */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none group" 
          onClick={() => {
            setSelectedCaseId(null);
            setIsCreatingNew(false);
            setIsRAGExplorerActive(false);
          }}
        >
          <UnikornLogo size="md" showText={true} />
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Global Language Switcher */}
          <LanguageSelectorButton variant="light" />

          {/* Super Admin Control Center Button - Restricted strictly to clearfile360@gmail.com */}
          {user?.email?.toLowerCase() === "clearfile360@gmail.com" && (
            <button
              onClick={() => setIsSuperAdminModalOpen(true)}
              title="சூப்பர் அட்மின் நிர்வாக மையம் (Super Admin Control Center)"
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Super Admin</span>
            </button>
          )}

          {/* Android App Button */}
          <button
            onClick={() => setIsAndroidModalOpen(true)}
            title="ஆண்ட்ராய்டு செயலி (Android APK & PWA App)"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden lg:inline">{t("ஆண்ட்ராய்டு செயலி", "Android App")}</span>
          </button>

          {/* Guideline Calculator Button */}
          <button
            onClick={() => setIsGuidelineModalOpen(true)}
            title="வழிகாட்டி மதிப்பு & பதிவு கட்டணம் (Guideline Calculator)"
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Calculator className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden xl:inline">{t("வழிகாட்டி மதிப்பு", "Guideline Value")}</span>
          </button>

          {/* Revenue Appeals Tracker Button */}
          <button
            onClick={() => setIsAppealsModalOpen(true)}
            title="மேல்முறையீட்டு காலக்கெடு கணக்கிட்டான் (Appeals Limitation)"
            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Hourglass className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden xl:inline">{t("மேல்முறையீடு", "Appeals")}</span>
          </button>

          {/* Plan & Pricing Badge Button */}
          <button
            onClick={() => {
              setIsLimitNotice(false);
              setIsPricingModalOpen(true);
            }}
            title="சேவை திட்டங்கள் மற்றும் கட்டணங்கள் (Pricing Plans)"
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">{t(currentPlanConfig.nameTamil, currentPlanConfig.nameEnglish)}</span>
            <span className="px-1.5 py-0.2 bg-purple-900 text-amber-300 text-[10px] font-mono font-black rounded-md">
              {cases.length}/{maxCases === 999999 ? '∞' : maxCases}
            </span>
          </button>

          <button
            onClick={() => {
              setIsRAGExplorerActive(!isRAGExplorerActive);
              setSelectedCaseId(null);
              setIsCreatingNew(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 cursor-pointer border ${
              isRAGExplorerActive 
                ? "bg-purple-800 text-white border-purple-900 shadow-sm" 
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden md:inline">{t("சட்ட அறிவுக் களஞ்சியம்", "RAG Knowledge Explorer")}</span>
            <span className="md:hidden">{t("அறிவுத்தளம்", "RAG Engine")}</span>
          </button>


          <div className="flex space-x-1.5 sm:space-x-2 hidden md:flex">
            <span className="px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-black rounded-full uppercase tracking-wider border border-emerald-300">செயலில் உள்ளது</span>
            <span className="px-3 py-0.5 sm:py-1 bg-purple-50 text-purple-900 text-[10px] sm:text-[11px] font-black rounded-full uppercase tracking-wider border border-purple-200">தமிழ்நாடு மண்டலம்</span>
          </div>

          {isAuthLoading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsProfileMenuOpen(true)}
                title="பயனர் சுயவிவரம் மற்றும் அமைப்புகள் (Profile & Settings)"
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all duration-150 cursor-pointer border border-slate-300 group bg-slate-50"
              >
                <div className="flex flex-col items-end text-right hidden sm:flex">
                  <span className="text-xs font-black text-slate-900 leading-tight truncate max-w-[150px] group-hover:text-purple-700 transition-colors">
                    {user.displayName || "அறியப்படாத பயனர்"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wide leading-none">{user.email}</span>
                </div>

                <div className="w-8 h-8 rounded-full border border-purple-400 overflow-hidden shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-purple-500 transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-700 text-white font-black flex items-center justify-center text-xs">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-700 transition-colors hidden sm:block" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGoogleLogin()}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all duration-150 shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.185 15.39 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.742-.08-1.302-.177-1.859H12.24z"/>
                </svg>
                <span>Google Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full flex flex-col">
        
        {/* Workspace Aggregate Metrics */}
        {!selectedCase && !isCreatingNew && !isRAGExplorerActive && (
          <StatWidgets cases={cases} onSelectCase={(id) => { setSelectedCaseId(id); setIsRAGExplorerActive(false); }} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {isRAGExplorerActive ? (
            <div className="lg:col-span-12 space-y-4">
              <div className="flex items-center justify-between no-print mb-1">
                <button
                  onClick={() => setIsRAGExplorerActive(false)}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-800 transition uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>வழக்குக் கோப்புகள் பட்டியலுக்குத் திரும்புக</span>
                </button>
              </div>
              <SupabaseRAGExplorer />
            </div>
          ) : (!selectedCaseId && !isCreatingNew) ? (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sidebar list (5 columns) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4.5 w-4.5 text-purple-700" />
                    வழக்குக் கோப்புகள் ({filteredCases.length})
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingNew(true);
                      setIsRAGExplorerActive(false);
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl transition flex items-center gap-1 text-[11px] font-black cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>புதிய கோப்பு</span>
                  </button>
                </div>

                {/* Cloud Sync Status Info Indicator */}
                {!user ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <Sparkles className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-purple-900 uppercase tracking-tight">மேகக்கணி பாதுகாப்பான சேமிப்பு</h4>
                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                        உங்கள் வழக்கின் ஆவணங்களைப் பாதுகாப்பாக சேமிக்க Google கணக்கு மூலம் உள்நுழையவும்.
                      </p>
                      <button
                        onClick={handleGoogleLogin}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        உள்நுழைக (Google Login)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-tight">மேகக்கணி சேமிப்பு செயலில் உள்ளது</span>
                    </div>
                    <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 uppercase">ONLINE</span>
                  </div>
                )}

                {/* Filter and Search controls */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="வாடிக்கையாளர், கிராமம், பிரச்சனை தேடுக..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 text-slate-900 border border-slate-300 rounded-xl cursor-pointer outline-none transition"
                  >
                    <option value="All">அனைத்து பிரிவுகளும்</option>
                    <option value="Revenue">நில வருவாய் (Revenue)</option>
                    <option value="Registration">பத்திரப்பதிவு (Registration)</option>
                    <option value="Family / Inheritance">குடும்பம் / வாரிசுரிமை (Family)</option>
                    <option value="Government Land">அரசு நிலம் (Govt Land)</option>
                    <option value="Public Property">பொதுச் சொத்து (Public)</option>
                    <option value="Litigation">நீதிமன்ற வழக்கு (Litigation)</option>
                  </select>
                </div>

                {/* List items */}
                <div className="space-y-2.5 overflow-y-auto max-h-[440px] pr-1">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-8 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center mx-auto">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">வழக்குக் கோப்புகள் ஏதும் இல்லை</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">உங்கள் அலுவலக கணக்கில் புதிய வழக்கைப் பதிவு செய்யலாம்.</p>
                      </div>
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={() => {
                            setIsCreatingNew(true);
                            setIsRAGExplorerActive(false);
                          }}
                          className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" />
                          <span>புதிய வழக்கு சேர்க்கை</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredCases.map((c) => {
                      let riskColor = "bg-emerald-500";
                      if (c.stage9?.score > 75) riskColor = "bg-rose-600";
                      else if (c.stage9?.score > 45) riskColor = "bg-amber-500";

                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/50 cursor-pointer transition-all duration-150 flex items-start gap-3 relative group shadow-xs"
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setActiveTab("analysis");
                            setIsRAGExplorerActive(false);
                          }}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${riskColor}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-extrabold text-slate-900 text-xs truncate max-w-[130px]">{c.stage0?.clientName}</span>
                              <span className="text-[10px] text-purple-800 font-extrabold uppercase tracking-wider bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">{c.stage1?.category}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate font-semibold">Survey #{c.stage0?.surveyNumber} • {c.stage0?.village}, {c.stage0?.district}</p>
                            <p className="text-[11px] text-slate-700 line-clamp-1 mt-1 font-medium leading-normal">{c.stage2?.rootCauseStatement}</p>
                          </div>
                          
                          {/* Trash Delete icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaseToDeleteId(c.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition sm:opacity-0 group-hover:opacity-100 absolute right-2.5 top-2.5 z-10 cursor-pointer"
                            title="வழக்கினை நீக்குக"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Main Welcome Dashboard Panel (8 columns) - Professional Office Look */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between h-full space-y-6 relative overflow-hidden">
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 font-black text-[10px] rounded-full uppercase tracking-widest border border-purple-200">
                      நிலம்360 சொத்து & சட்ட மேடை
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500 font-semibold">தமிழ்நாடு நில ஒழுங்குமுறை v2.0</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight font-display">
                    வாடிக்கையாளரின் நிலப் பிரச்சனைகளைத் துல்லியமான சட்ட மதிப்பீடுகள் மற்றும் நோட்டீஸ்களாக மாற்றுங்கள்.
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-4 font-normal">
                    நிலம்360 தளம் நில உரிமையாளர்கள், வழக்கறிஞர்கள், கிராம நிர்வாக அலுவலர்கள் (VAO) மற்றும் பட்டா மனுதாரர்களுக்குத் தமிழ்நாடு நில வருவாய் ஒழுங்குமுறைகளின் கீழ் வழிகாட்டும் அதிகாரப்பூர்வ சேவை மையம் ஆகும். இது நிலப் பிரச்சனைகளின் மூலக்காரணத்தைக் கண்டறிந்து, கால வரம்பு மதிப்பீடுகளை வழங்கி, அதிகாரிகளுக்கான மனுக்கள் மற்றும் தடையுத்தரவு நோட்டீஸ்களைத் தயாரிக்கிறது.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">📋 சொத்து மதிப்பீடு (10-நிலை)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        நில அடையாளங்கள், ஆவண இடைவெளிகள், உள்ளூர் வருவாய் அதிகாரி வழித்தடங்கள் மற்றும் தணிக்கை சரிபார்ப்புப் பட்டியல்.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">📜 சட்ட நோட்டீஸ் & மனுக்கள்</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        பிரிவு 77A ஆட்சேபனை மனுக்கள், வருவாய் அலுவலர் மேல்முறையீடுகள் மற்றும் அதிகாரப்பூர்வ பிரதிநிதித்துவ அறிவிப்பு வரைவுகள்.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setIsCreatingNew(true);
                      setIsRAGExplorerActive(false);
                    }}
                    className="px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>புதிய சொத்து மதிப்பீட்டைத் தொடங்கு</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ) : isCreatingNew ? (
            /* Intake Form Workspace View */
            <div className="lg:col-span-12 space-y-4">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 transition uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>வழக்குக் கோப்புகள் பட்டியலுக்குத் திரும்புக</span>
                </button>
              </div>

              {errorText && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 text-rose-800 text-xs items-center">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-extrabold block">செயல்முறை தோல்வியடைந்தது</span>
                    <span>{errorText}</span>
                  </div>
                </div>
              )}

              <IntakeForm 
                onSubmit={handleCreateCase} 
                isLoading={isAnalyzing} 
                currentCaseCount={cases.length} 
                maxCases={maxCases} 
                onOpenPricing={() => { 
                  setIsLimitNotice(true); 
                  setIsPricingModalOpen(true); 
                }} 
              />
            </div>
          ) : (
            /* Active Selected Case View */
            <div className="lg:col-span-12 space-y-6">
              
              {/* Top toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-slate-200 pb-4">
                
                {/* Back Link */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCaseId(null)}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-600 transition cursor-pointer shadow-xs"
                    title="கோப்புகள் பட்டியலுக்குத் திரும்பு"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-900 font-display leading-tight">
                        {selectedCase?.stage0?.clientName}-இன் சொத்து கோப்பு
                      </h2>
                      <span className="px-2 py-0.5 bg-purple-100 border border-purple-200 text-purple-900 font-extrabold text-[8px] rounded uppercase tracking-wider">
                        செயலில் உள்ளது
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      சர்வே எண்: {selectedCase?.stage0?.surveyNumber} • {selectedCase?.stage0?.village}, {selectedCase?.stage0?.district}
                    </p>
                  </div>
                </div>

                {/* Centered Tab Segment Selectors - Refined Professional Office Terminology */}
                <div className="bg-slate-100 p-1 rounded-xl border border-slate-300 flex flex-wrap gap-1 shadow-xs self-start md:self-auto">
                  {[
                    { key: "analysis", label: "📋 சொத்து மதிப்பீடு" },
                    { key: "brief", label: "👤 வாடிக்கையாளர் நடவடிக்கை" },
                    { key: "draft", label: "📜 சட்ட நோட்டீஸ் வரைவு" },
                    { key: "precedents", label: "⚖️ முன்மாதிரி & சட்ட உத்தி" }
                  ].map((tb) => {
                    const isSelected = activeTab === tb.key;
                    return (
                      <button
                        key={tb.key}
                        onClick={() => setActiveTab(tb.key as any)}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-150 cursor-pointer ${
                          isSelected 
                            ? "bg-purple-700 text-white shadow-xs" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        {tb.label}
                      </button>
                    );
                  })}
                </div>

                {/* Right utility buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGlobalPDFDownload}
                    disabled={isDownloadingGlobalPDF}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 rounded-xl shadow-3xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title="மனுவை PDF ஆகப் பதிவிறக்கவும் (Download PDF)"
                  >
                    {isDownloadingGlobalPDF ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Download className="h-4 w-4 text-white" />
                    )}
                    <span className="text-[11px] font-extrabold hidden sm:inline">
                      {isDownloadingGlobalPDF ? t("PDF தயாராகிறது...", "Generating PDF...") : t("PDF பதிவிறக்கம்", "Download PDF")}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2.5 border rounded-xl shadow-3xs transition cursor-pointer flex items-center gap-1.5 ${
                      showHistory 
                        ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                        : "bg-white text-slate-600 border-slate-250 hover:bg-slate-100"
                    }`}
                    title="மாற்றங்களின் வரலாறு"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold hidden sm:inline">வரலாறு ({selectedCase?.history?.length || 1})</span>
                  </button>
                  <button
                    onClick={() => selectedCase && setCaseToDeleteId(selectedCase.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 rounded-xl text-rose-600 hover:text-rose-700 shadow-3xs transition cursor-pointer"
                    title="வழக்கினை நீக்குக"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* RENDER ACTIVE SCREEN */}
              {selectedCase && (
                <div>
                  {/* Print-Only Professional Legal Header */}
                  <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase font-display tracking-tight leading-none">யுனிகார்ன்360 சொத்து சட்டப்பணி தளம்</h1>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mt-1">தமிழ்நாடு நில வருவாய் ஒழுங்குமுறை அறிக்கை</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 font-mono">வழக்கு கோப்பு எண்: UK360-{String(selectedCase.id).toUpperCase().slice(-6)}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {new Date().toLocaleDateString("ta-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* Main Active Tab Content Area */}
                    <div className="flex-1 w-full min-w-0 transition-all duration-200">
                      {activeTab === "analysis" && (
                        <AnalysisDashboard 
                          key={selectedCase.id}
                          caseData={selectedCase} 
                          onUpdateCase={handleUpdateCase}
                        />
                      )}
                      
                      {activeTab === "brief" && (
                        <ClientReplyPanel 
                          key={selectedCase.id}
                          caseData={selectedCase}
                        />
                      )}

                      {activeTab === "draft" && (
                        <DocumentDraftPanel 
                          key={selectedCase.id}
                          caseData={selectedCase}
                          onUpdateDraft={handleUpdateDraft}
                        />
                      )}

                      {activeTab === "precedents" && (
                        <PrecedentAndStrategyPanel 
                          key={selectedCase.id}
                          caseData={selectedCase}
                        />
                      )}
                    </div>

                    {/* History Sidebar Panel */}
                    {showHistory && (
                      <div className="w-full xl:w-80 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs shrink-0 space-y-4 no-print">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-600" />
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">மாற்றங்களின் வரலாறு</h3>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                            {selectedCase.history?.length || 1} பதிவுகள்
                          </span>
                        </div>

                        <div className="relative pl-4 border-l border-slate-200 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {(selectedCase.history || [
                            {
                              id: "hist_init_" + selectedCase.id,
                              timestamp: selectedCase.createdAt || new Date().toISOString(),
                              description: "வாடிக்கையாளர் தகவல்களிலிருந்து வழக்குத் தொடங்கப்பட்டது."
                            }
                          ]).map((log, idx) => (
                            <div key={log.id || idx} className="relative text-xs">
                              {/* Timeline dot */}
                              <div className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                              
                              <p className="text-[10px] font-bold text-slate-400 font-mono">
                                {new Date(log.timestamp).toLocaleDateString("ta-IN", { day: 'numeric', month: 'short' })}{" "}
                                {new Date(log.timestamp).toLocaleTimeString("ta-IN", { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-slate-600 font-semibold mt-1 leading-relaxed">
                                {log.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Google Sign-In Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">கூகுள் கணக்கில் உள்நுழைக (Google Authentication)</h3>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Real Google Login</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-5">
              உங்கள் உண்மையான கூகுள் கணக்கு மூலம் பாதுகாப்பான நேரடி உள்நுழைவைத் தொடங்க கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்.
            </p>

            <div className="space-y-3 mb-6">
              {/* Primary Real Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.185 15.39 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.742-.08-1.302-.177-1.859H12.24z"/>
                </svg>
                <span>கூகுள் மூலம் நேரடியாக உள்நுழைக (Real Google Login)</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
              >
                மூடுக (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Error / Iframe Warning Modal */}
      {loginError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">உள்நுழைவு அறிவிப்பு (Sign-In Alert)</h3>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">iframe popup restriction / browser block</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-6">
              {loginError}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(window.location.origin, "_blank");
                  setLoginError(null);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                புதிய தாவலில் திறக்கவும் (Open in New Tab)
              </button>

              <button
                type="button"
                onClick={() => setLoginError(null)}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 text-center cursor-pointer"
              >
                மூடுக (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Account Settings Modal */}
      {isProfileMenuOpen && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden bg-indigo-600 shrink-0 shadow-md">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full text-white font-black flex items-center justify-center text-xl">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-400/30">
                      இணைக்கப்பட்ட பயனர்
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white truncate mt-1">{user.displayName || "அறியப்படாத பயனர்"}</h3>
                  <p className="text-xs text-indigo-200 font-medium truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-5 bg-slate-900 text-slate-100">
              {/* Account Overview & Active Plan Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">வழக்குகள் பயன்பாடு</p>
                  <p className="text-base font-black text-white mt-0.5">
                    {cases.length} / <span className="text-amber-400 font-extrabold">{maxCases === 999999 ? 'வரம்பற்றது' : maxCases}</span>
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">செயலில் உள்ள திட்டம்</p>
                  <p className="text-xs font-black text-amber-400 mt-1 truncate">{currentPlanConfig.nameTamil}</p>
                </div>
              </div>

              {/* Upgrade Plan Callout */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsLimitNotice(false);
                  setIsPricingModalOpen(true);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 border border-amber-400/40 text-white flex items-center justify-between transition cursor-pointer shadow-lg hover:border-amber-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-lg shrink-0 font-bold">
                    <Zap className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block text-white">சேவை திட்டங்கள் & கட்டணங்கள்</span>
                    <span className="text-[10px] text-slate-300 font-medium">திட்டங்களை உயர்த்தி மேலும் வசதிகளைப் பெறுக</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </button>

              {/* Data Storage & Sync Status */}
              <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                  <Database className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-black text-white">தரவுச் சேமிப்பு நிலை (Data Sync Status)</p>
                  <p className="text-slate-300 font-medium mt-0.5">
                    {isFirebaseMockEnabled 
                      ? "உள்ளூர் உலாவி சேமிப்பகத்தில் (Local Storage) தகவல்கள் பாதுகாப்பாக உள்ளன."
                      : "ஃபையர்பேஸ் மேகக்கணி (Firebase Cloud Firestore) மூலம் ஒத்திசைக்கப்பட்டு பாதுகாக்கப்படுகிறது."}
                  </p>
                </div>
              </div>

              {/* Account Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  கணக்கு அமைப்புகள் & விருப்பங்கள் (Account Options)
                </label>

                {/* Super Admin Control Center Option - Restricted strictly to clearfile360@gmail.com */}
                {user?.email?.toLowerCase() === "clearfile360@gmail.com" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSuperAdminModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-amber-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <div>
                        <span className="font-black text-amber-300 block">சூப்பர் அட்மின் நிர்வாகம் (Super Admin Panel)</span>
                        <span className="text-[10px] text-amber-400/80">பயனாளர்கள் கணக்குகள், திட்டங்கள் & அனுமதி மாற்றம்</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-400" />
                  </button>
                )}

                {/* Android App Quick Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsAndroidModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">ஆண்ட்ராய்டு செயலி (Android App & APK)</span>
                      <span className="text-[10px] text-slate-400">போனில் செயலியை நிறுவ & APK பதிவிறக்க</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                {/* Guideline Calculator Quick Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsGuidelineModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">வழிகாட்டி மதிப்பு கணக்கிட்டான்</span>
                      <span className="text-[10px] text-slate-400">நில வழிகாட்டி மதிப்பு & பதிவுக் கட்டணம்</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                {/* Appeals Limitation Tracker Quick Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsAppealsModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Hourglass className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="font-bold text-white block">மேல்முறையீட்டு காலக்கெடு கணக்கீடு</span>
                      <span className="text-[10px] text-slate-400">வருவாய் நீதிமன்ற காலக்கெடு மற்றும் சட்டங்கள்</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                {/* Switch / Change Account */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-amber-400/50 hover:bg-slate-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">வேறு கணக்கிற்கு மாறுக (Switch Account)</span>
                      <span className="text-[10px] text-slate-400">வேறு கூகுள் கணக்கில் உள்நுழைய</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                {/* LOGOUT BUTTON */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full py-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    <span>கணக்கிலிருந்து வெளியேறு (Logout)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {caseToDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">வழக்குக் கோப்பை நீக்குக</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  இந்த வழக்கை நிச்சயமாக நீக்க விரும்புகிறீர்களா?
                </p>
              </div>
            </div>

            {(() => {
              const targetCase = cases.find(c => c.id === caseToDeleteId);
              if (!targetCase) return null;
              return (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <p className="text-xs font-black text-white">{targetCase.stage0?.clientName || "பெயரிடப்படாத வழக்கு"}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    சர்வே எண்: {targetCase.stage0?.surveyNumber} • {targetCase.stage0?.village}, {targetCase.stage0?.district}
                  </p>
                  <p className="text-[10px] text-rose-400 font-bold mt-1">
                    * இந்நடவடிக்கை நிரந்தரமானது. மீட்டெடுக்க முடியாது.
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCaseToDeleteId(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                ரத்து செய்க (Cancel)
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteCase(caseToDeleteId)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                நீக்குக (Delete Case)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing & Subscription Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setIsLimitNotice(false);
        }}
        currentPlan={userPlan}
        currentCaseCount={cases.length}
        onSelectPlan={handleSelectPlan}
        isLimitReachedNotice={isLimitNotice}
      />

      {/* Android APK & PWA Installation Modal */}
      <AndroidApkModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* TN Guideline Value & Stamp Duty Calculator Modal */}
      <GuidelineCalculatorModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
      />

      {/* TN Revenue Appeals Limitation Tracker Modal */}
      <RevenueAppealsTrackerModal
        isOpen={isAppealsModalOpen}
        onClose={() => setIsAppealsModalOpen(false)}
      />

      {/* Super Admin User Control Dashboard Modal */}
      <SuperAdminModal
        isOpen={isSuperAdminModalOpen}
        onClose={() => setIsSuperAdminModalOpen(false)}
        currentUserEmail={user?.email || "clearfile360@gmail.com"}
        onPlanChangedRemotely={() => {
          const freshPlan = localStorage.getItem("unikorn360_user_plan") as PlanType;
          if (freshPlan) {
            setUserPlan(freshPlan);
          }
        }}
      />

      {/* Footer styled beautifully */}
      <footer className="bg-slate-950 border-t border-slate-800 py-5 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <UnikornLogo size="sm" showText={false} />
            <span className="text-slate-400 font-bold">
              NILAM360 AI © 2026 • A Sub-brand of <strong className="text-amber-300 font-extrabold">UNIKORN360 AI SOLUTIONS</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] font-mono">
            <span>சென்னை தலைமை அலுவலகம்</span>
            <span>•</span>
            <span>மதுரை மையம்</span>
            <span>•</span>
            <span>தமிழ்நாடு நில வருவாய் சட்டம் v2.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
