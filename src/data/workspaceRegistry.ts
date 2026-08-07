export type WorkspaceId = "Citizen360" | "Professional360" | "Enterprise360" | "Government360" | "Industry360";

export type SubWorkspaceId = "Property360" | "Legal360";

export type Property360ModuleId = 
  | "Registration"
  | "Revenue"
  | "Survey"
  | "Municipal"
  | "Banking"
  | "Property Litigation"
  | "Property Documents"
  | "Property Intelligence";

export type Legal360ModuleId = 
  | "Criminal360"
  | "Family360"
  | "Consumer360"
  | "Labour360"
  | "Tax360"
  | "Corporate360"
  | "Cyber360"
  | "Constitution360"
  | "Arbitration360";

export type ModuleId = Property360ModuleId | Legal360ModuleId;

export type AIEngineId = 
  | "CaseClassificationAI"
  | "DocumentVerificationAI"
  | "PrecedentIntelligenceAI"
  | "StrategySimulatorAI"
  | "LegalDraftingAI"
  | "ClientGuidanceAI"
  // Consumer360 AI Agents
  | "ProductDefectAI"
  | "ServiceDeficiencyAI"
  | "CompensationAI"
  | "EvidenceAuditAI"
  | "NoticeComplaintAI"
  | "ConsumerPrecedentAI"
  | "ExecutionAI";

export interface AIEngineConfig {
  id: AIEngineId;
  nameEn: string;
  nameTa: string;
  descriptionTa: string;
  stageNumber: number;
}

export interface ModuleConfig {
  id: ModuleId;
  titleEn: string;
  titleTa: string;
  descriptionTa: string;
  keywords: string[];
  iconName: string;
  badge?: string;
  engines?: AIEngineConfig[];
}

export interface SubWorkspaceConfig {
  id: SubWorkspaceId;
  titleEn: string;
  titleTa: string;
  descriptionTa: string;
  modules: ModuleConfig[];
}

export interface WorkspaceConfig {
  id: WorkspaceId;
  titleEn: string;
  titleTa: string;
  descriptionTa: string;
  subWorkspaces: SubWorkspaceConfig[];
  isAvailable: boolean;
}

export class WorkspaceRegistry {
  public static readonly STANDARD_AI_ENGINES: AIEngineConfig[] = [
    {
      id: "CaseClassificationAI",
      nameEn: "Case Classification & Jurisdiction AI",
      nameTa: "வழக்கு வகைப்பாடு & அதிகாரம் பகுப்பாய்வு AI",
      descriptionTa: "வழக்கின் சட்டப் பிரிவு, வரம்பு எல்லை மற்றும் அதிகார வரம்பை துல்லியமாக பகுப்பாய்வு செய்யும் AI.",
      stageNumber: 1
    },
    {
      id: "DocumentVerificationAI",
      nameEn: "Document & Evidence Audit AI",
      nameTa: "ஆவணங்கள் & ஆதார தணிக்கை AI",
      descriptionTa: "பத்திரங்கள், சான்றுகள், வில்லங்கம் மற்றும் எஃப்.ஐ.ஆர் ஆவணங்களை சரிபார்க்கும் AI.",
      stageNumber: 3
    },
    {
      id: "PrecedentIntelligenceAI",
      nameEn: "Precedent Intelligence & Case Law AI",
      nameTa: "உயர்/உச்ச நீதிமன்ற முன்மாதிரி தீர்ப்புகள் AI",
      descriptionTa: "இணைப்பு தீர்ப்புகள், 77A உத்தரவுகள், உச்ச நீதிமன்ற மற்றும் சென்னை உயர் நீதிமன்ற முன்மாதிரிகளை கண்டறியும் AI.",
      stageNumber: 11
    },
    {
      id: "StrategySimulatorAI",
      nameEn: "Strategy & Outcome Simulator AI",
      nameTa: "சட்ட உத்தி & முடிவுகள் கணிப்பு AI",
      descriptionTa: "வெற்றி வாய்ப்புகள், ஆபத்து காரணி மற்றும் மாற்று சட்ட உத்திகளை சிமுலேட் செய்யும் AI.",
      stageNumber: 12
    },
    {
      id: "LegalDraftingAI",
      nameEn: "Legal Petition & Notice Drafter AI",
      nameTa: "மனுக்கள் & நோட்டீஸ் வரைவு AI",
      descriptionTa: "ரிட் மனு, வக்கீல் நோட்டீஸ், மேல்முறையீடு மற்றும் சிவில் மனுக்களை வரைவு செய்யும் AI.",
      stageNumber: 8
    },
    {
      id: "ClientGuidanceAI",
      nameEn: "Citizen Action Plan & Advisory AI",
      nameTa: "குடிமக்களுக்கான நடவடிக்கை வழிகாட்டி AI",
      descriptionTa: "அடுத்து செய்ய வேண்டிய 5 அவசியமான படிநிலைகள் மற்றும் நடைமுறை சட்ட வழிகாட்டுதல் வழங்கும் AI.",
      stageNumber: 9
    }
  ];

  public static readonly CONSUMER360_AI_AGENTS: AIEngineConfig[] = [
    {
      id: "ProductDefectAI",
      nameEn: "Product Defect Agent",
      nameTa: "தயாரிப்பு குறைபாடு AI Agent",
      descriptionTa: "தயாரிப்பு கோளாறு, உத்தரவாதம் (Warranty) மற்றும் தயாரிப்பு பொறுப்பு (Product Liability) பகுப்பாய்வு செய்யும் Agent.",
      stageNumber: 1
    },
    {
      id: "ServiceDeficiencyAI",
      nameEn: "Service Deficiency Agent",
      nameTa: "சேவை குறைபாடு AI Agent",
      descriptionTa: "சேவை தாமதம், ஒப்பந்த மீறல் மற்றும் மோசமான சேவைத்திறன் மதிப்பீடு செய்யும் Agent.",
      stageNumber: 2
    },
    {
      id: "CompensationAI",
      nameEn: "Compensation Agent",
      nameTa: "நஷ்டஈடு கணக்கீட்டு AI Agent",
      descriptionTa: "நிதி இழப்பு, மன உளைச்சல், மருத்துவ செலவு மற்றும் சட்டப்பூர்வ நஷ்டஈடு தொகையை கணக்கிடும் Agent.",
      stageNumber: 8
    },
    {
      id: "EvidenceAuditAI",
      nameEn: "Evidence Agent",
      nameTa: "சான்றுகள் & பில்கள் தணிக்கை AI Agent",
      descriptionTa: "பில்கள், ரசீதுகள், மின்னஞ்சல்கள், வாட்ஸ்அப் மற்றும் நிபுணர் சான்றுகளை சரிபார்க்கும் Agent.",
      stageNumber: 6
    },
    {
      id: "NoticeComplaintAI",
      nameEn: "Notice & Complaint Agent",
      nameTa: "நோட்டீஸ் & புகார் வரைவு AI Agent",
      descriptionTa: "சட்ட நோட்டீஸ் மற்றும் நுகர்வோர் ஆணையப் புகார்களை (Consumer Complaint Draft) வரைவு செய்யும் Agent.",
      stageNumber: 10
    },
    {
      id: "ConsumerPrecedentAI",
      nameEn: "Consumer Precedent Agent",
      nameTa: "நுகர்வோர் தீர்ப்புகள் AI Agent",
      descriptionTa: "உச்ச நீதிமன்றம், தேசிய நுகர்வோர் ஆணையம் (NCDRC) மற்றும் மாநில ஆணைய தீர்ப்புகளை கண்டறியும் Agent.",
      stageNumber: 11
    },
    {
      id: "ExecutionAI",
      nameEn: "Execution Agent",
      nameTa: "நிறைவேற்றுதல் & ஆணை அமலாக்க AI Agent",
      descriptionTa: "நுகர்வோர் நீதிமன்ற உத்தரவு அமலாக்கம் மற்றும் இழப்பீடு வசூல் நடவடிக்கைகளை கண்காணிக்கும் Agent.",
      stageNumber: 12
    }
  ];

  public static readonly PROPERTY360_MODULES: ModuleConfig[] = [
    {
      id: "Registration",
      titleEn: "Registration Engine",
      titleTa: "பத்திரப்பதிவு & சார்பதிவாளர் (Registration Engine)",
      descriptionTa: "கிரைய பத்திரம், வில்லங்க சான்று (EC), பிரிவு 77A போலி பத்திரம் ரத்து & SRO ஆவணங்கள்.",
      keywords: ["registration", "sale deed", "sro", "encumbrance", "ec", "77a", "sub registrar", "stamp duty", "power of attorney", "கிரையம்", "பத்திரம்", "சார்பதிவாளர்"],
      iconName: "FileCheck",
      badge: "⭐ Core Engine"
    },
    {
      id: "Revenue",
      titleEn: "Revenue & Patta Engine",
      titleTa: "வருவாய்த் துறை & பட்டா (Revenue Engine)",
      descriptionTa: "பட்டா, சிட்டா, அடங்கல், தாசில்தார், RDO, DRO மேல்முறையீடு & UDR திருத்தம்.",
      keywords: ["patta", "chitta", "adangal", "tahsildar", "rdo", "dro", "udr", "revenue", "mutation", "பட்டா", "சிட்டா", "தாசில்தார்"],
      iconName: "Landmark",
      badge: "Popular"
    },
    {
      id: "Survey",
      titleEn: "Survey & Boundary Engine",
      titleTa: "நில அளவை & எல்லை (Survey Engine)",
      descriptionTa: "FMB வரைபடம், நத்தம் சர்வே, நில எல்லைத் தகராறு & தாலுகா சர்வேயர் அளவீடு.",
      keywords: ["survey", "fmb", "natham", "boundary", "town survey", "surveyor", "அளவை", "எல்லை", "வரைபடம்"],
      iconName: "Compass"
    },
    {
      id: "Municipal",
      titleEn: "Municipal & Layout Engine",
      titleTa: "நகராட்சி & மனைப் பிரிவு (Municipal Engine)",
      descriptionTa: "DTCP/CMDA மனைப் பிரிவு அனுமதி, கட்டட வரைபடம், ஆக்கிரமிப்பு அகற்றம்.",
      keywords: ["dtcp", "cmda", "layout", "municipal", "panchayat", "building plan", "encroachment", "மனைப் பிரிவு", "நகராட்சி"],
      iconName: "Building2"
    },
    {
      id: "Banking",
      titleEn: "Banking & Legal Audit",
      titleTa: "வங்கி கடன் & சட்டத் தணிக்கை (Banking Engine)",
      descriptionTa: "வங்கிக் கடன் அடமானம் (MODT), NOC, சொத்து சட்டத் தணிக்கை அறிக்கை & SARFAESI.",
      keywords: ["bank", "mortgage", "modt", "legal audit", "sarfaesi", "loan", "noc", "வங்கிக் கடன்", "அடமானம்"],
      iconName: "Briefcase"
    },
    {
      id: "Property Litigation",
      titleEn: "Property Litigation Engine",
      titleTa: "சொத்து உரிமையியல் வழக்குகள் (Litigation Engine)",
      descriptionTa: "உரிமையியல் நீதிமன்றத்தில் உரிமைப் பிரகடனம், பாகப்பிரிவினை, நிரந்தரத் தடை உத்தரவு (Injunction).",
      keywords: ["injunction", "partition", "declaration", "title suit", "civil court", "writ", "வழக்கு", "தடை உத்தரவு", "பாகப்பிரிவினை"],
      iconName: "Gavel"
    },
    {
      id: "Property Documents",
      titleEn: "Property Documents Vault",
      titleTa: "தாய் ஆவணங்கள் & செட்டில்மென்ட் (Property Documents)",
      descriptionTa: "தாய் பத்திரங்கள், பாகப் பிரிவு ஆவணம், தான செட்டில்மென்ட், உயில் (Will) & வாரிசு சான்று.",
      keywords: ["parent document", "settlement", "will", "partition deed", "gift deed", "தாய் பத்திரம்", "உயில்", "செட்டில்மென்ட்"],
      iconName: "FileText"
    },
    {
      id: "Property Intelligence",
      titleEn: "Property Intelligence & Valuation",
      titleTa: "சொத்து மதிப்பு & AI பகுப்பாய்வு (Property Intelligence)",
      descriptionTa: "வழிகாட்டி மதிப்பு (Guideline Value), சந்தை மதிப்பு, முன்மாதிரி தீர்ப்புகள் & AI உத்தி.",
      keywords: ["guideline value", "valuation", "precedent", "market value", "intelligence", "வழிகாட்டி மதிப்பு"],
      iconName: "Sparkles"
    }
  ];

  public static readonly LEGAL360_MODULES: ModuleConfig[] = [
    {
      id: "Criminal360",
      titleEn: "Criminal360",
      titleTa: "குற்றவியல் & காவல் துறை (Criminal360)",
      descriptionTa: "எஃப்.ஐ.ஆர் (FIR), முன்ஜாமீன் (Anticipatory Bail), காவல் நிலைய புகார் & பிரிவு 482 Quash.",
      keywords: ["fir", "bail", "criminal", "police", "quash", "cheating", "forgery", "எஃப்.ஐ.ஆர்", "ஜாமீன்", "காவல் நிலை"],
      iconName: "ShieldAlert"
    },
    {
      id: "Family360",
      titleEn: "Family360",
      titleTa: "குடும்பவியல் & வாரிசுரிமை (Family360)",
      descriptionTa: "விவாகரத்து, ஜீவனாம்சம் (Maintenance), குழந்தை பராமரிப்பு, குடும்ப வன்முறை (DV Act).",
      keywords: ["divorce", "maintenance", "custody", "family", "dv act", "domestic violence", "விவாகரத்து", "ஜீவனாம்சம்"],
      iconName: "HeartHandshake"
    },
    {
      id: "Consumer360",
      titleEn: "Consumer360",
      titleTa: "நுகர்வோர் பாதுகாப்பு (Consumer360)",
      descriptionTa: "நுகர்வோர் நீதிமன்ற வழக்குகள், குறைபாடுள்ள பொருட்கள், சேவை குறைபாடு & நஷ்டஈடு.",
      keywords: ["consumer", "forum", "defective", "compensation", "service deficiency", "நுகர்வோர்"],
      iconName: "ShoppingBag"
    },
    {
      id: "Labour360",
      titleEn: "Labour360",
      titleTa: "தொழிலாளர் & பணிநீக்கம் (Labour360)",
      descriptionTa: "சட்டவிரோத பணிநீக்கம், PF / ESI தகராறு, கிராஜுவிட்டி & தொழிலாளர் நீதிமன்றம்.",
      keywords: ["labour", "employment", "termination", "pf", "esi", "gratuity", "தொழிலாளர்"],
      iconName: "HardHat"
    },
    {
      id: "Tax360",
      titleEn: "Tax360",
      titleTa: "வரி & ஜிஎஸ்டி வழக்குகள் (Tax360)",
      descriptionTa: "ஜிஎஸ்டி (GST) நோட்டீஸ், வருமான வரி நோட்டீஸ், மேல்முறையீடு & தீர்ப்பாயம்.",
      keywords: ["gst", "income tax", "notice", "appeal", "tribunal", "tax", "வரி"],
      iconName: "Receipt"
    },
    {
      id: "Corporate360",
      titleEn: "Corporate360",
      titleTa: "நிறுவனச் சட்டம் & NCLT (Corporate360)",
      descriptionTa: "இயக்குநர்கள் தகராறு, பங்களிப்பாளர்கள் வழக்கு, NCLT மேல்முறையீடு & கம்பெனி சட்டம்.",
      keywords: ["nclt", "company", "director", "shareholder", "corporate", "நிறுவனம்"],
      iconName: "Building"
    },
    {
      id: "Cyber360",
      titleEn: "Cyber360",
      titleTa: "சைபர் குற்றம் & இணைய மோசடி (Cyber360)",
      descriptionTa: "ஆன்லைன் நிதி மோசடி, தரவு திருட்டு, IT சட்டம் & சைபர் கிரைம் புகார்.",
      keywords: ["cyber", "fraud", "online", "hacking", "it act", "சைபர்"],
      iconName: "Cpu"
    },
    {
      id: "Constitution360",
      titleEn: "Constitution360",
      titleTa: "அரசியலமைப்பு & பேராணை (Constitution360)",
      descriptionTa: "உயர் நீதிமன்ற நல்வழி ஆணை (Writ Article 226), அடிப்படை உரிமைகள் & பொதுநல வழக்கு.",
      keywords: ["writ", "mandamus", "article 226", "constitution", "high court", "பேராணை"],
      iconName: "Scale"
    },
    {
      id: "Arbitration360",
      titleEn: "Arbitration360",
      titleTa: "மத்தியஸ்தம் & வணிக தீர்வு (Arbitration360)",
      descriptionTa: "ஒப்பந்த மத்தியஸ்தம் (ADR), வணிக தகராறு தீர்வு & அவார்டு அமலாக்கம்.",
      keywords: ["arbitration", "adr", "commercial", "contract", "award", "மத்தியஸ்தம்"],
      iconName: "Handshake"
    }
  ];

  public static readonly WORKSPACES: WorkspaceConfig[] = [
    {
      id: "Citizen360",
      titleEn: "Citizen360 Workspace",
      titleTa: "சிட்டிசன்360 முதன்மை சட்ட மையம் (Citizen360 Workspace)",
      descriptionTa: "குடிமக்களுக்கான சொத்து, பட்டா, பத்திரப்பதிவு மற்றும் அனைத்து வகை சட்டப் பிரச்சினைகளுக்கான முதன்மை AI தீர்வாக விளங்கும் ஒருங்கிணைந்த தளம்.",
      isAvailable: true,
      subWorkspaces: [
        {
          id: "Property360",
          titleEn: "Property360",
          titleTa: "சொத்து360 (Property360)",
          descriptionTa: "நிலம், கட்டடம், பட்டா, பத்திரப்பதிவு, நகராட்சி மற்றும் சொத்து ஆவணங்களின் முழுமையான வாழ்க்கைச் சுழற்சி மையம்.",
          modules: WorkspaceRegistry.PROPERTY360_MODULES
        },
        {
          id: "Legal360",
          titleEn: "Legal360",
          titleTa: "லீகல்360 (Legal360)",
          descriptionTa: "குற்றவியல், குடும்பம், நுகர்வோர், வரி, நிறுவன சட்டம் உள்ளிட்ட அனைத்து சட்டத் துறைகளுக்கான பிரத்யேக AI தீர்வு மையம்.",
          modules: WorkspaceRegistry.LEGAL360_MODULES
        }
      ]
    },
    {
      id: "Professional360",
      titleEn: "Professional360",
      titleTa: "புரொஃபெஷனல்360 (வக்கீல்கள் & ஆடிட்டர்கள்)",
      descriptionTa: "வழக்கறிஞர்கள், ஆவண எழுதுபவர்கள் மற்றும் தணிக்கையாளர்களுக்கான வழக்கு மேலாண்மை & வரைவு மையம்.",
      isAvailable: false,
      subWorkspaces: []
    },
    {
      id: "Enterprise360",
      titleEn: "Enterprise360",
      titleTa: "எண்டர்பிரைஸ்360 (நிறுவனங்கள் & வங்கிகள்)",
      descriptionTa: "நிறுவனங்கள் மற்றும் வங்கிகளுக்கான சொத்து சட்டத் தணிக்கை மற்றும் ஒப்பந்த கண்காணிப்பு தளம்.",
      isAvailable: false,
      subWorkspaces: []
    },
    {
      id: "Government360",
      titleEn: "Government360",
      titleTa: "கவர்ன்மென்ட்360 (அரசுத் துறை)",
      descriptionTa: "வருவாய்த் துறை மற்றும் பதிவுத் துறை அதிகாரிகளுக்கான AI ஆவண சரிபார்ப்பு மையம்.",
      isAvailable: false,
      subWorkspaces: []
    },
    {
      id: "Industry360",
      titleEn: "Industry360",
      titleTa: "இண்டஸ்ட்ரி360 (ரியல் எஸ்டேட் & கட்டடக் கலை)",
      descriptionTa: "ரியல் எஸ்டேட் புரோமோட்டர்கள் மற்றும் பில்டர்களுக்கான மனைப்பிரிவு மற்றும் அனுமதி சரிபார்ப்பு மையம்.",
      isAvailable: false,
      subWorkspaces: []
    }
  ];

  /**
   * Auto-routes an incoming raw description text to the most relevant Workspace, SubWorkspace, Module, and AI Engine
   */
  public static autoRouteByDescription(text: string): { workspace: WorkspaceId; subWorkspace: SubWorkspaceId; module: ModuleId; engine: AIEngineId } {
    const lower = text.toLowerCase();

    // Check Property360 keywords
    for (const mod of WorkspaceRegistry.PROPERTY360_MODULES) {
      for (const kw of mod.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return { workspace: "Citizen360", subWorkspace: "Property360", module: mod.id, engine: "CaseClassificationAI" };
        }
      }
    }

    // Check Legal360 keywords
    for (const mod of WorkspaceRegistry.LEGAL360_MODULES) {
      for (const kw of mod.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return { workspace: "Citizen360", subWorkspace: "Legal360", module: mod.id, engine: "CaseClassificationAI" };
        }
      }
    }

    // Default fallback
    return { workspace: "Citizen360", subWorkspace: "Property360", module: "Registration", engine: "CaseClassificationAI" };
  }
}
