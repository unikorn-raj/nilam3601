import React, { useState, useEffect } from "react";
import { PropertyCase } from "../types";
import { 
  FileText, Copy, Check, Sparkles, Send, RefreshCw, 
  ChevronRight, CornerDownRight, HelpCircle, ShieldCheck, QrCode, Download
} from "lucide-react";
import { generateDocumentSeal, DocumentSealInfo } from "../lib/security";
import { auth } from "../lib/firebase";
import { downloadDocumentAsPDF } from "../lib/pdfExport";
import { useLanguage } from "../lib/languageContext";

interface DocumentDraftPanelProps {
  key?: any;
  caseData: PropertyCase;
  onUpdateDraft: (newTitle: string, newContent: string, historyDesc?: string) => void;
}

export function DocumentDraftPanel({ caseData, onUpdateDraft }: DocumentDraftPanelProps) {
  const { t } = useLanguage();
  const [draftTitle, setDraftTitle] = useState(() => caseData.customDocumentDraft?.documentTitle || "சட்ட அறிவிப்பு / மனு");
  const [draftContent, setDraftContent] = useState(() => caseData.customDocumentDraft?.documentContent || "");
  const [originalTitle, setOriginalTitle] = useState(() => caseData.customDocumentDraft?.documentTitle || "சட்ட அறிவிப்பு / மனு");
  const [originalContent, setOriginalContent] = useState(() => caseData.customDocumentDraft?.documentContent || "");
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sealInfo, setSealInfo] = useState<DocumentSealInfo | null>(null);

  useEffect(() => {
    if (caseData.id && draftContent) {
      generateDocumentSeal(caseData.id, draftContent).then(setSealInfo);
    }
  }, [caseData.id, draftContent]);

  const handleTitleBlur = () => {
    if (draftTitle !== originalTitle) {
      onUpdateDraft(draftTitle, draftContent, `வரைவுத் தலைப்பு மாற்றப்பட்டது: "${draftTitle}"`);
      setOriginalTitle(draftTitle);
    }
  };

  const handleContentBlur = () => {
    if (draftContent !== originalContent) {
      onUpdateDraft(draftTitle, draftContent, "வரைவு உள்ளடக்கங்கள் கைமுறையாக மாற்றப்பட்டது");
      setOriginalContent(draftContent);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadDocumentAsPDF({
        title: draftTitle || "சட்ட வரைவு மனு (Legal Draft Petition)",
        reportType: "AI LEGAL DRAFT",
        docType: caseData.stage1?.category ? `${caseData.stage1.category} / Representation` : "Police / Legal Representation",
        domain: "Property Law (Property360 Intelligence)",
        caseId: `UK360-${String(caseData.id).toUpperCase().slice(-6)}`,
        status: "AI Draft | Advocate Review Recommended",
        content: draftContent || "சட்ட வரைவு விவரங்கள் இல்லை.",
        sealHash: sealInfo?.sha256Hash,
        filename: `${draftTitle || "AO_Draft"}_${caseData.id}`
      });
    } catch (err) {
      console.error("PDF Download failed:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      let authToken = "";
      if (auth.currentUser) {
        try {
          authToken = await auth.currentUser.getIdToken();
        } catch (err) {
          console.warn("Failed to get user ID Token:", err);
        }
      }

      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          caseData,
          documentTitle: draftTitle,
          instructions
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "வரைவை மேம்படுத்துவதில் தோல்வி அடைந்தது.");
      }

      const data = await response.json();
      setDraftTitle(data.documentTitle);
      setDraftContent(data.documentContent);
      
      const instrSnippet = instructions.length > 35 
        ? instructions.slice(0, 35) + "..." 
        : instructions;
      onUpdateDraft(data.documentTitle, data.documentContent, `AI மூலம் வரைவு மேம்படுத்தப்பட்டது: "${instrSnippet}"`);
      
      setOriginalTitle(data.documentTitle);
      setOriginalContent(data.documentContent);
      setInstructions(""); // clear instructions
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "ஆவணத்தை மேம்படுத்துவதில் ஏதோ தவறு நிகழ்ந்துள்ளது.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Interactive drafting viewer/editor (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-4 print:w-full print:border-none print:shadow-none">
        <div className="bg-white rounded-2xl border border-slate-250 shadow-xs flex flex-col h-[520px] overflow-hidden print:h-auto print:border-none print:shadow-none print:overflow-visible">
          
          {/* Draft header */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white print:border-b-2 print:border-slate-800 print:px-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-600 print:hidden no-print" />
              <input 
                type="text" 
                value={draftTitle} 
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                }}
                onBlur={handleTitleBlur}
                className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-200 rounded px-1.5 py-0.5 w-[280px] md:w-[420px] font-display print:text-lg print:text-slate-900 print:w-full"
              />
            </div>

            <div className="flex items-center gap-2 print:hidden no-print">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs disabled:opacity-50"
                title="AO வரைவை PDF கோப்பாக பதிவிறக்கவும் (Download Draft as PDF)"
              >
                {isDownloadingPDF ? (
                  <>
                    <RefreshCw className="animate-spin h-3.5 w-3.5 text-white" />
                    <span className="text-[11px] font-extrabold">{t("PDF உருவாகிறது...", "Generating PDF...")}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 text-white" />
                    <span className="text-[11px] font-extrabold">{t("PDF பதிவிறக்கம்", "Download PDF")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-250 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center gap-1 cursor-pointer shadow-3xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-700">{t("நகலெடுக்கப்பட்டது!", "Copied!")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px]">{t("நகலெடு", "Copy Text")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Draft editor text area */}
          <div className="flex-1 p-5 relative bg-slate-50/50 print:bg-white print:p-0">
            {isRefining && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 print:hidden no-print">
                <RefreshCw className="animate-spin h-8 w-8 text-indigo-600" />
                <span className="text-xs font-bold text-slate-600">சட்ட அளவுருக்களுடன் மீண்டும் வரைவு செய்யப்படுகிறது...</span>
              </div>
            )}
            <textarea
              value={draftContent}
              onChange={(e) => {
                setDraftContent(e.target.value);
              }}
              onBlur={handleContentBlur}
              className="w-full h-[360px] font-mono text-[11px] text-slate-700 p-4 bg-white border border-slate-200 rounded-xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-3xs print:hidden"
              placeholder="வழக்கு மதிப்பீடு வரைவு இங்கே தோன்றும்..."
            />

            {sealInfo && (
              <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-[10px] print:mt-6 print:border print:border-slate-300 print:text-slate-900 print:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold tracking-wider text-slate-200 uppercase font-mono">UNIKORN360 SHA-256 VERIFIABLE LEGAL SEAL</p>
                    <p className="text-slate-400 font-mono text-[9px] mt-0.5">HASH: {sealInfo.sha256Hash} • TIME: {new Date(sealInfo.timestamp).toLocaleDateString("ta-IN")}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-emerald-300 font-mono text-[9px]">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>TAMPER-PROOF RECORD</span>
                </div>
              </div>
            )}

            <div className="hidden print:block font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-900 bg-white p-2 border border-transparent min-h-[400px]">
              {draftContent || "ஆவண வரைவு இன்னும் உருவாக்கப்படவில்லை."}
              {sealInfo && (
                <div className="mt-8 pt-4 border-t border-slate-400 text-[10px] font-mono text-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold">VERIFIABLE LEGAL RECORD SEAL • UNIKORN360 ENTERPRISE</p>
                    <p>CASE ID: {sealInfo.caseId} | SHA-256 HASH: {sealInfo.sha256Hash}</p>
                  </div>
                  <p className="text-right">{new Date().toLocaleString("ta-IN")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Refiner and Instructions panel (4 cols) */}
      <div className="lg:col-span-4 space-y-6 print:hidden no-print">
        
        {/* AI Prompt Refiner Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 pl-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">மனுவை மேம்படுத்தும் AI</h3>
          </div>

          <div className="pl-2 space-y-4">
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              சட்டப்பிரிவுகளைச் சேர்க்க, தொனியை மாற்ற அல்லது வாடிக்கையாளரின் குறிப்பிட்ட நிபந்தனைகளைச் சேர்க்க எளிய தமிழில் கட்டளைகளை வழங்கவும். ஜெமினி உடனடியாக முழு வரைவையும் மாற்றி எழுதும்.
            </p>

            <form onSubmit={handleRefine} className="space-y-3.5">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="எ.கா: 'எதிர்த்தரப்பினர் போலியாகப் பதிவு செய்தால் குற்றவியல் நடவடிக்கை எடுக்கப்படும் என எச்சரிக்கும் பத்தியைச் சேர்க்கவும்.'"
                className="w-full p-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
              />
              {errorMessage && (
                <p className="text-xs text-rose-600 font-bold">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={isRefining || !instructions.trim()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-sm disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                <span>மனுவின் வரைவை மேம்படுத்து</span>
              </button>
            </form>
          </div>
        </div>

        {/* Guidance Reference Panel */}
        <div className="bg-slate-100 p-5 rounded-2xl border border-slate-250 space-y-3.5">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">பயனுள்ள சட்டப்பிரிவுகள் (ஆலோசனைகள்):</h4>
          
          <div className="space-y-2.5 text-[11px] text-slate-600">
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>பிரிவு 77A (பத்திரப்பதிவு சட்டம்):</strong> போலி ஆவணங்களை ரத்து செய்ய பதிவாளர்களுக்கு அதிகாரம் அளித்தல்.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>UDR சர்வே பிழை திருத்தம்:</strong> வருவாய் கோட்டாட்சியரை (RDO) நேரடியாக அணுகலாம்.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>வழக்கு சட்டம் பிரிவு 34 (Specific Relief Act):</strong> சொத்துரிமையை நிலைநாட்ட உரிமையியல் நீதிமன்றத்தில் பிரகடன வழக்கு.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
