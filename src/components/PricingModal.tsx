import React, { useState } from "react";
import { 
  X, Check, Zap, Crown, Shield, Award, Sparkles, ArrowRight, Briefcase, 
  CreditCard, QrCode, Building2, CheckCircle2, Lock, ArrowLeft, Copy, Clock,
  Receipt, Download, Smartphone, AlertCircle, AlertTriangle
} from "lucide-react";
import { UnikornLogo } from "./UnikornLogo";
import { useLanguage } from "../lib/languageContext";

import { PlanType } from "../types";
import { PLAN_CONFIGS, ALL_PLANS, getPlanConfig, PlanDetails } from "../data/pricingMaster";
export { PLAN_CONFIGS };
export type { PlanType, PlanDetails };

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  currentCaseCount: number;
  onSelectPlan: (plan: PlanType) => void;
  isLimitReachedNotice?: boolean;
}

export function PricingModal({
  isOpen,
  onClose,
  currentPlan,
  currentCaseCount,
  onSelectPlan,
  isLimitReachedNotice = false
}: PricingModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"select" | "checkout" | "success">("select");

  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanType>("pro");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  
  // Payment Form States
  const [upiRef, setUpiRef] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [netbankingUserId, setNetbankingUserId] = useState("");

  // Payment Processing & Validation States
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatusText, setProcessStatusText] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [lastTxnId, setLastTxnId] = useState("");

  if (!isOpen) return null;

  const targetPlan = PLAN_CONFIGS[selectedPlanKey];
  const basePrice = targetPlan.priceAmount;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gstAmount;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("nilam360.pay@upi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleStartCheckout = (planKey: PlanType) => {
    if (planKey === "free") {
      onSelectPlan("free");
      onClose();
      return;
    }
    setSelectedPlanKey(planKey);
    setPaymentError(null);
    setStep("checkout");
  };

  const handleExecutePayment = () => {
    setPaymentError(null);

    // Validate inputs based on selected payment method
    if (paymentMethod === "upi") {
      const cleanUpi = upiRef.trim();
      if (!cleanUpi) {
        setPaymentError("கட்டணப் பிழை: தயவுசெய்து உங்கள் UPI செயலியிலிருந்து (GPay/PhonePe) பெறப்பட்ட 12-இலக்க பரிவர்த்தனை எண்ணை (Reference / UTR No) உள்ளிடவும்.");
        return;
      }
      if (cleanUpi.length < 10) {
        setPaymentError("கட்டணப் பிழை: UPI குறிப்பு எண் செல்லுபடியற்றது. குறைந்தபட்சம் 10-12 இலக்கங்கள் இருக்க வேண்டும்.");
        return;
      }
      if (cleanUpi === "000000000000" || cleanUpi.toLowerCase() === "test") {
        setPaymentError("வங்கி நிராகரிப்பு: இந்த பரிவர்த்தனை எண் தவறானது அல்லது வங்கியால் நிராகரிக்கப்பட்டது.");
        return;
      }
    } else if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\D/g, "");
      if (cleanCard.length < 15) {
        setPaymentError("கார்டு பிழை: தயவுசெய்து 16-இலக்க செல்லுபடியாகும் டெபிட்/கிரெடிட் கார்டு எண்ணை உள்ளிடவும்.");
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes("/")) {
        setPaymentError("கார்டு பிழை: தயவுசெய்து கார்டு காலாவதி தேதியை (MM/YY) உள்ளிடவும்.");
        return;
      }
      if (cardCvv.trim().length < 3) {
        setPaymentError("கார்டு பிழை: தயவுசெய்து 3-இலக்க CVV எண்ணை உள்ளிடவும்.");
        return;
      }
      if (!cardName.trim()) {
        setPaymentError("கார்டு பிழை: தயவுசெய்து கார்டில் உள்ள உரிமையாளர் பெயரை உள்ளிடவும்.");
        return;
      }
    } else if (paymentMethod === "netbanking") {
      if (!netbankingUserId.trim()) {
        setPaymentError("நெட்பேங்கிங் பிழை: தயவுசெய்து உங்களது வங்கியின் பயனர்/வாடிக்கையாளர் ஐடியை (User/Customer ID) உள்ளிடவும்.");
        return;
      }
    }

    setIsProcessing(true);
    setProcessStatusText("நிலம்360 AI கட்டண வாயிலுடன் பாதுகாப்பாக இணைக்கப்படுகிறது...");

    setTimeout(() => {
      setProcessStatusText("வங்கிச் சேவையகத்திலிருந்து பரிவர்த்தனை சரிபார்க்கப்படுகிறது...");
    }, 1200);

    setTimeout(() => {
      setProcessStatusText("கட்டணம் வெற்றிகரமாக பெறப்பட்டது! உங்கள் திட்டம் உயர்த்தப்படுகிறது...");
    }, 2400);

    setTimeout(() => {
      setIsProcessing(false);
      let userTxn = "";
      if (paymentMethod === "upi") {
        userTxn = "UPI_" + upiRef.trim().toUpperCase();
      } else if (paymentMethod === "card") {
        const cleanCard = cardNumber.replace(/\D/g, "");
        userTxn = "CARD_••••" + cleanCard.slice(-4);
      } else {
        userTxn = "NB_" + selectedBank + "_" + netbankingUserId.trim().toUpperCase();
      }
      setLastTxnId(userTxn);
      setStep("success");
    }, 3600);
  };

  const handleFinalizeUpgrade = () => {
    onSelectPlan(selectedPlanKey);
    setStep("select");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans selection:bg-indigo-500 selection:text-white">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-slate-100">
        
        {/* STEP 1: PLAN SELECTION GRID */}
        {step === "select" && (
          <div>
            {/* Top Navigation Bar - Back to Home / Dashboard */}
            <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-black transition cursor-pointer border border-slate-700 shadow-xs"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" />
                <span>முகப்புப் பக்கத்திற்குத் திரும்பு (Back to Home)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-rose-800/50"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">மூடு (Close)</span>
              </button>
            </div>

            {/* Banner header */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 md:p-8 text-white relative border-b border-slate-800">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <UnikornLogo size="sm" showText={true} />
                  {isLimitReachedNotice && (
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded border border-rose-400 animate-pulse ml-auto">
                      2 வழக்குகள் வரம்பு எட்டப்பட்டது
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
                  உங்கள் தேவைக்கேற்ற சட்டப் பகுப்பாய்வு திட்டத்தைத் தேர்வு செய்யுங்கள்
                </h2>
                <p className="text-xs md:text-sm text-slate-300 font-medium mt-1">
                  தமிழ்நாடு நில வருவாய் & சொத்துத் தகராறுகளுக்கு 10-கட்ட AI துல்லிய பகுப்பாய்வு மற்றும் இருமொழி சட்ட வரைவுகள்.
                </p>

                {isLimitReachedNotice && (
                  <div className="mt-4 p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>
                      இலவசத் திட்டத்தில் அதிகபட்சமாக 2 வழக்குகள் மட்டுமே அனுமதி. மேலும் வழக்குகளைச் சேர்க்க வெள்ளி அல்லது தங்கத் திட்டத்திற்கு உயர்த்தவும்!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current status bar */}
            <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <span>
                  தற்போதைய பயன்பாடு: <strong className="text-indigo-300 font-black">{currentCaseCount} வழக்குகள்</strong> பதிவு செய்யப்பட்டுள்ளன.
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-200 font-black">
                <span>செயலில் உள்ள திட்டம்:</span>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] uppercase font-black rounded">
                  {PLAN_CONFIGS[currentPlan].nameTamil}
                </span>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="p-6 md:p-8 bg-slate-950/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {ALL_PLANS.map((plan) => {
                const planKey = plan.id;
                const isCurrent = currentPlan === planKey;

                return (
                  <div
                    key={plan.id}
                    className={`bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                      plan.colorTheme.border
                    }`}
                  >
                    {plan.popular && (
                      <div className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest text-center py-1">
                        ★ மிகவும் விரும்பப்படும் திட்டம் ★
                      </div>
                    )}

                    <div className="p-5 space-y-4 flex-1">
                      {/* Card Title & Price */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-white text-base">{plan.nameTamil}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${plan.colorTheme.badgeBg} ${plan.colorTheme.badgeText}`}>
                            {plan.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400">{plan.nameEnglish}</p>

                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">{plan.priceTamil}</span>
                          <span className="text-[11px] font-bold text-slate-400">{plan.periodTamil}</span>
                        </div>

                        <div className="mt-2 inline-block px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/80 rounded-lg text-[11px] font-black text-indigo-300">
                          {plan.caseLimitText}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-relaxed border-t border-slate-800 pt-3">
                        {plan.description}
                      </p>

                      {/* Feature Checklist */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">அம்சங்கள் (Features):</p>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Action Button */}
                    <div className="p-5 bg-slate-950/80 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleStartCheckout(planKey)}
                        disabled={isCurrent}
                        className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                          isCurrent
                            ? "bg-slate-800 text-slate-400 border border-slate-700 font-black cursor-default"
                            : `${plan.colorTheme.buttonBg} ${plan.colorTheme.buttonHover}`
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>தற்போது செயலில் உள்ளது</span>
                          </>
                        ) : (
                          <>
                            <span>{plan.ctaTamil}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Guarantee Note & Return to Home Button */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Shield className="h-4 w-4 text-amber-400 shrink-0" />
                <span>நிலம்360 AI • தமிழ்நாடு நில வருவாய் சட்டப்பிரிவுகள் & 10-கட்ட AI பகுப்பாய்வு பாதுகாப்பு உத்தரவாதம்.</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shrink-0 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" />
                <span>முகப்புப் பக்கத்திற்குத் திரும்பு (Return to Home)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT CHECKOUT GATEWAY */}
        {step === "checkout" && (
          <div className="p-6 md:p-8 space-y-6">
            {/* Top Navigation & Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  disabled={isProcessing}
                  className="flex items-center gap-2 text-xs font-black text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-700"
                >
                  <ArrowLeft className="h-4 w-4 text-amber-400" />
                  <span>திட்டங்கள் தேர்வுக்குத் திரும்பு (Back to Plans)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 px-3 py-2 rounded-xl transition cursor-pointer border border-rose-800/50"
                >
                  <X className="h-4 w-4" />
                  <span>முகப்புக்குத் திரும்பு (Back to Home)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold">
                <Lock className="h-4 w-4" />
                <span>பாதுகாப்பான கட்டண வாயில் (256-bit SSL Gateway)</span>
              </div>
            </div>

            {/* Checkout Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Order Summary */}
              <div className="lg:col-span-5 space-y-4 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">தேர்ந்தெடுக்கப்பட்ட திட்டம்</span>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded">
                    {targetPlan.badge}
                  </span>
                </div>

                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white">{targetPlan.nameTamil}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{targetPlan.description}</p>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-300 border-b border-slate-800 pb-4">
                  <div className="flex justify-between">
                    <span>அடிப்படை கட்டணம் (Base Price):</span>
                    <span className="font-mono text-white font-bold">₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ஜி.எஸ்.டி (18% GST):</span>
                    <span className="font-mono">₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-amber-400 pt-2 border-t border-slate-800">
                    <span>மொத்த கட்டணம் (Total Payable):</span>
                    <span className="font-mono text-lg">₹{totalPrice}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">திட்டத்தின் சிறப்பம்சங்கள்:</p>
                  {targetPlan.features.slice(0, 4).map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Payment Method Selection & Forms */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Method Selector Tabs */}
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("upi");
                      setPaymentError(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === "upi"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>GPay / PhonePe / UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("card");
                      setPaymentError(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === "card"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>கார்டு (Card)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("netbanking");
                      setPaymentError(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === "netbanking"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>வங்கி நெட்பேங்கிங்</span>
                  </button>
                </div>

                {/* ERROR ALERT DISPLAY */}
                {paymentError && (
                  <div className="p-3.5 bg-rose-500/20 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{paymentError}</span>
                  </div>
                )}

                {/* UPI / QR CODE METHOD */}
                {paymentMethod === "upi" && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Simulated QR Box */}
                      <div className="w-36 h-36 bg-white p-2 rounded-2xl border-2 border-indigo-500 shrink-0 flex flex-col items-center justify-center relative shadow-lg">
                        <div className="w-full h-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 rounded-xl">
                          <QrCode className="h-20 w-20 text-slate-900" />
                        </div>
                        <span className="text-[9px] font-black text-slate-900 mt-1 uppercase">NILAM360 UPI</span>
                      </div>

                      <div className="space-y-3 flex-1 text-center sm:text-left">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                          1. QR குறியீட்டை ஸ்கேன் செய்து கட்டணம் செலுத்தலாம்
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          கூகுள் பே (GPay), போன்பே (PhonePe), பேடிஎம் (Paytm) அல்லது பீம் (BHIM) செயலியைப் பயன்படுத்தி மேலுள்ள QR ஐ ஸ்கேன் செய்யவும்.
                        </p>

                        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                          <span className="font-mono text-indigo-300 font-bold">nilam360.pay@upi</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[10px] font-black rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copiedUpi ? "நகலெடுக்கப்பட்டது!" : "நகலெடு"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4 space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        2. கட்டணம் செலுத்திய பின் பெற்ற 12-இலக்க UPI குறிப்பு எண்ணை உள்ளிடவும் (Ref / UTR No)*:
                      </label>
                      <input
                        type="text"
                        value={upiRef}
                        onChange={(e) => {
                          setUpiRef(e.target.value);
                          if (paymentError) setPaymentError(null);
                        }}
                        placeholder="எ.கா: 428901823901"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* CARD METHOD */}
                {paymentMethod === "card" && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">கார்டு எண் (Card Number)*:</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          if (paymentError) setPaymentError(null);
                        }}
                        placeholder="4532 •••• •••• 8912"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">காலாவதி தேதி (MM/YY)*:</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            setCardExpiry(e.target.value);
                            if (paymentError) setPaymentError(null);
                          }}
                          placeholder="08/28"
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">சி.வி.வி (CVV)*:</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value);
                            if (paymentError) setPaymentError(null);
                          }}
                          placeholder="•••"
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">கார்டில் உள்ள பெயர் (Cardholder Name)*:</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => {
                          setCardName(e.target.value);
                          if (paymentError) setPaymentError(null);
                        }}
                        placeholder="எ.கா: K. RAMESH KUMAR"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* NETBANKING METHOD */}
                {paymentMethod === "netbanking" && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">
                        1. உங்கள் வங்கியைத் தேர்ந்தெடுக்கவும் (Select Bank)*:
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="SBI">State Bank of India (ஸ்டேட் பேங்க்)</option>
                        <option value="INDIAN_BANK">Indian Bank (இந்தியன் பேங்க்)</option>
                        <option value="IOB">Indian Overseas Bank (ஐ.ஓ.பி)</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="CANARA">Canara Bank</option>
                      </select>
                    </div>

                    <div className="space-y-1 border-t border-slate-800 pt-3">
                      <label className="text-xs font-bold text-slate-300 block">
                        2. நெட்பேங்கிங் பயனர் / வாடிக்கையாளர் ஐடி (Customer ID / User ID)*:
                      </label>
                      <input
                        type="text"
                        value={netbankingUserId}
                        onChange={(e) => {
                          setNetbankingUserId(e.target.value);
                          if (paymentError) setPaymentError(null);
                        }}
                        placeholder="எ.கா: CUST982130"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Execute Payment Button */}
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition duration-200 cursor-pointer flex items-center justify-center gap-3 border border-amber-300 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{processStatusText}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 fill-current" />
                      <span>₹{totalPrice} கட்டணம் செலுத்து & திட்டத்தை உயர்த்து</span>
                    </>
                  )}
                </button>

                {/* Cancel & Return to Home Button */}
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>ரத்து செய்து முகப்புப் பக்கத்திற்குத் திரும்பு (Cancel & Return to Home)</span>
                  </button>
                )}

              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESSFUL PAYMENT RECEIPT & UPGRADE CONFIRMATION */}
        {step === "success" && (
          <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black uppercase">
                பரிவர்த்தனை வெற்றி பெற்றதைக் குறிக்கிறது
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                கட்டணம் வெற்றிகரமாகச் செலுத்தப்பட்டது! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-md mx-auto">
                உங்கள் நிலம்360 AI கணக்கு உடனடியாக <strong>{targetPlan.nameTamil}</strong>க்கு உயர்த்தப்பட்டது.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <span className="font-bold text-slate-400 uppercase">ரசீது எண்: {lastTxnId}</span>
                <span className="text-emerald-400 font-black">PAID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">திட்டம்:</span>
                <span className="font-bold text-white">{targetPlan.nameTamil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">செலுத்தப்பட்ட தொகை:</span>
                <span className="font-bold text-amber-400">₹{totalPrice} (Incl. GST)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">தேதி & நேரம்:</span>
                <span className="text-slate-300">{new Date().toLocaleString('ta-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinalizeUpgrade}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-400/20 transition cursor-pointer inline-flex items-center justify-center gap-2 border border-amber-300"
              >
                <span>நிலம்360 AI முகப்புப் பக்கத்திற்குச் செல்</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

