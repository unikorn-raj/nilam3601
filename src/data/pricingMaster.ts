import { PlanType } from "../types";

export type PlanCategory = "citizen" | "professional" | "enterprise";

export interface PlanDetails {
  id: PlanType;
  category: PlanCategory;
  nameTamil: string;
  nameEnglish: string;
  badge: string;
  priceAmount: number;
  priceTamil: string;
  periodTamil: string;
  caseLimitText: string;
  maxCases: number;
  popular?: boolean;
  description: string;
  features: string[];
  ctaTamil: string;
  adminLabel: string;
  colorTheme: {
    border: string;
    bgHeader: string;
    badgeBg: string;
    badgeText: string;
    buttonBg: string;
    buttonHover: string;
    ring: string;
  };
}

export const PLAN_CONFIGS: Record<PlanType, PlanDetails> = {
  free: {
    id: "free",
    category: "citizen",
    nameTamil: "இலவசத் திட்டம் (Free)",
    nameEnglish: "Free Tier",
    badge: "அடிப்படை",
    priceAmount: 0,
    priceTamil: "₹0",
    periodTamil: "எப்போதும் இலவசம்",
    caseLimitText: "2 வழக்குகள் மட்டும் (Max 2 Cases)",
    maxCases: 2,
    description: "நில வருவாய் & சொத்துத் தகராறுகளைச் சோதித்து அறிய மற்றும் அடிப்படை சட்ட பகுப்பாய்விற்கு உகந்தது.",
    features: [
      "2 வழக்குகள் வரை இலவசப் பகுப்பாய்வு",
      "10-கட்ட நில வருவாய் தணிக்கை (10-Stage Audit)",
      "தமிழ் & ஆங்கில இருமொழி சுருக்கம்",
      "வாட்ஸ்அப் / பிடிஎஃப் முன்னோட்டம்",
      "பாதுகாப்பான தரவுச் சேமிப்பு"
    ],
    ctaTamil: "தற்போதைய திட்டம்",
    adminLabel: "Free Plan (2 Cases / ₹0)",
    colorTheme: {
      border: "border-slate-800",
      bgHeader: "bg-slate-900",
      badgeBg: "bg-slate-800",
      badgeText: "text-slate-300",
      buttonBg: "bg-slate-800 text-slate-400 border border-slate-700",
      buttonHover: "hover:bg-slate-700",
      ring: "ring-slate-700"
    }
  },
  pro: {
    id: "pro",
    category: "citizen",
    nameTamil: "வெள்ளித் திட்டம் (Pro)",
    nameEnglish: "Pro Tier",
    badge: "பிரபலம்",
    priceAmount: 499,
    priceTamil: "₹499",
    periodTamil: "மாதம் (15 Cases/Month)",
    caseLimitText: "15 வழக்குகள் வரை (15 Cases/Month)",
    maxCases: 15,
    popular: true,
    description: "தனிநபர் வழக்குதாரர்கள், கிராம நிர்வாக அலுவலர்கள் மற்றும் நிலச் சட்ட ஆலோசகர்களுக்கு ஏற்றது.",
    features: [
      "15 வழக்குகள் வரை முழு பகுப்பாய்வு",
      "முழுமையான இருமொழி சட்ட மனுக்கள் & நோட்டீஸ்கள் (Draft Generator)",
      "வில்லங்கச் சான்றிதழ் & பட்டா தணிக்கை சரிபார்ப்பு பட்டியல்கள்",
      "PDF பதிவிறக்கம் மற்றும் அச்சிடும் வசதி",
      "நிலம்360 மேகக்கணி தரவு பாதுகாப்பு (Cloud Sync)",
      "உடனடி வாட்ஸ்அப் உதவி பெறலாம்"
    ],
    ctaTamil: "கட்டணம் செலுத்தி உயர்த்து (Upgrade Pro ₹499)",
    adminLabel: "Pro Plan (₹499 / 15 Cases)",
    colorTheme: {
      border: "border-indigo-500 border-2 shadow-xl shadow-indigo-950/50",
      bgHeader: "bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white",
      badgeBg: "bg-indigo-500",
      badgeText: "text-white font-extrabold",
      buttonBg: "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-extrabold shadow-md",
      buttonHover: "hover:from-indigo-500 hover:to-indigo-400",
      ring: "ring-indigo-400"
    }
  },
  advocate: {
    id: "advocate",
    category: "professional",
    nameTamil: "தங்கத் திட்டம் (Advocate / Professional)",
    nameEnglish: "Professional Advocate Tier",
    badge: "வழக்கறிஞர் பிரத்யேகம்",
    priceAmount: 2499,
    priceTamil: "₹2,499",
    periodTamil: "மாதம் (Unlimited)",
    caseLimitText: "வரம்பற்ற வழக்குகள் (Unlimited Cases)",
    maxCases: 999999,
    description: "உயர்நீதிமன்ற / மாவட்ட நீதிமன்ற வழக்கறிஞர்கள், ஆடிட்டர்கள் (CA) மற்றும் தொழில்முறை சட்ட ஆலோசகர்களுக்கு உகந்தது.",
    features: [
      "வரம்பற்ற சொத்து & சட்ட வழக்குக் கோப்புகள்",
      "Gemini 3.6 Flash அதிவேக AI பகுப்பாய்வு இயந்திரம்",
      "தமிழ்நாடு நில வருவாய் சட்ட அரசாணைகள் தேடுபொறி (RAG Search)",
      "நீதிமன்றக் கட்டணம் & காலக்கெடு ஆபத்து மதிப்பீடு",
      "வழக்கறிஞர் பிரத்யேக சேவைத் தொகுப்புகள் & வரைவு கருவிகள்",
      "24/7 பிரத்யேக தொலைபேசி / வாட்ஸ்அப் ஆதரவு"
    ],
    ctaTamil: "தங்கத் திட்டம் பெறுக (Advocate ₹2,499)",
    adminLabel: "Advocate Plan (₹2,499 / Unlimited)",
    colorTheme: {
      border: "border-amber-400 border-2 shadow-2xl shadow-amber-950/40",
      bgHeader: "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white",
      badgeBg: "bg-amber-400",
      badgeText: "text-slate-950 font-black",
      buttonBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md",
      buttonHover: "hover:from-amber-300 hover:to-amber-400",
      ring: "ring-amber-400"
    }
  },
  enterprise: {
    id: "enterprise",
    category: "enterprise",
    nameTamil: "வைரத் திட்டம் (Enterprise VIP)",
    nameEnglish: "Enterprise & Institutional Tier",
    badge: "நிறுவனம் / VIP",
    priceAmount: 4999,
    priceTamil: "₹4,999",
    periodTamil: "மாதம் / நிறுவனம் (Custom Seats)",
    caseLimitText: "வரம்பற்ற வழக்குகள் + Multi-User Seats",
    maxCases: 999999,
    description: "பெரிய சட்ட நிறுவனங்கள், நில மனைப் பிரிவு நிறுவனங்கள் & அரசு அமைப்புகளுக்கு பிரத்யேக பிரீமியம் திட்டம்.",
    features: [
      "நிறுவன பல-பயனாளர் கணக்குகள் (Multi-user RBAC)",
      "பிரத்யேக AI மாடல்கள் & RAG தரவுத்தளம்",
      "API ஒருங்கிணைப்பு & தனிப்பயன் வரைவு டெம்ப்ளேட்கள்",
      "பிரத்யேக மேலாளர் & முன்னுரிமை வாடிக்கையாளர் ஆதரவு",
      "வரம்பற்ற வழக்கு பகுப்பாய்வு & விரிவான அறிக்கை உருவாக்கம்"
    ],
    ctaTamil: "நிறுவனத் திட்டம் பெறுக (Enterprise ₹4,999)",
    adminLabel: "Enterprise VIP (₹4,999 / Custom Seats)",
    colorTheme: {
      border: "border-purple-500 border-2 shadow-2xl shadow-purple-950/40",
      bgHeader: "bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white",
      badgeBg: "bg-purple-500",
      badgeText: "text-white font-extrabold",
      buttonBg: "bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black shadow-md",
      buttonHover: "hover:from-purple-500 hover:to-purple-400",
      ring: "ring-purple-400"
    }
  }
};

export const ALL_PLANS: PlanDetails[] = [
  PLAN_CONFIGS.free,
  PLAN_CONFIGS.pro,
  PLAN_CONFIGS.advocate,
  PLAN_CONFIGS.enterprise
];

export function getPlanConfig(planId?: PlanType | string): PlanDetails {
  if (planId && planId in PLAN_CONFIGS) {
    return PLAN_CONFIGS[planId as PlanType];
  }
  return PLAN_CONFIGS.free;
}

export function calculateEstimatedMRR(users: { plan: string }[]): number {
  return users.reduce((acc, user) => {
    const config = getPlanConfig(user.plan);
    return acc + config.priceAmount;
  }, 0);
}
