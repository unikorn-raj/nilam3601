import { WorkspaceId, SubWorkspaceId, ModuleId, AIEngineId } from "./data/workspaceRegistry";

export interface IntakeData {
  workspace?: WorkspaceId; // "Citizen360" | "Professional360" | "Enterprise360" | "Government360" | "Industry360"
  subWorkspace?: SubWorkspaceId; // "Property360" | "Legal360"
  module?: ModuleId; // "Registration", "Revenue", "Survey", "Municipal", "Criminal360", etc.
  engine?: AIEngineId; // "CaseClassificationAI", "DocumentVerificationAI", "PrecedentIntelligenceAI", "StrategySimulatorAI", etc.
  clientName: string;
  mobile: string;
  surveyNumber?: string;
  village?: string;
  taluk?: string;
  district: string;
  oppositeParty: string;
  partyRelationship?: string; // e.g. Plaintiff/Defendant, Complainant/Accused, Employer/Employee, Buyer/Seller, Husband/Wife
  courtOrForum?: string; // e.g. District Court, Consumer Commission, Cyber Crime Police Station, High Court
  existingAdvocate: string;
  existingCaseNumber: string; // or FIR Number / Notice Ref
  limitationRisk: string;
}

export interface Stage1Data {
  category: string;
  specificType: string;
}

export interface Stage2Data {
  realIssue: string;
  rootCauseStatement: string;
}

export interface Stage3LegalMap {
  subjectType: string; // Stage 3: Property Type or Dispute Subject
  partyRelationshipMap: string; // Stage 3: Output: Party Relationship Map
}

export interface Stage4Timeline {
  timelineEvents: string[]; // Stage 4: Output: Cause of Action Timeline
}

export interface Stage5RightsMatrix {
  rightsViolated: string[];
  dutiesBreached: string[];
  legalObligations: string[];
  possibleLiabilities: string[];
  availableProtections: string[];
}

export interface Stage6Data {
  available: string[];
  missing: string[];
  documentary?: string[];
  electronic?: string[];
  witnesses?: string[];
  officialRecords?: string[];
  evidenceStrength?: "Weak" | "Moderate" | "Strong" | "Ironclad";
}

export interface Stage7JurisdictionMap {
  route: string[]; // Array of sequential authorities / forums
  primaryAuthority?: string;
  appellateAuthority?: string;
  forumType?: string;
}

export interface Stage8Data {
  category: string;
  primaryRemedy: string;
  remedyType?: "Administrative" | "Civil" | "Criminal" | "Alternative" | "Constitutional" | string;
  alternativeOptions?: string[];
}

export interface Stage9Data {
  factors: string[];
  score: number;
  rating: string; // Low | Medium | High | Critical
  limitationStatus?: string;
  urgencyLevel?: string;
}

export interface Stage10Data {
  packageName: string;
  priceRange: string;
  description: string;
  deliverablesList?: string[]; // Case Opinion, Summary, Chronology, Party Chart, Evidence Index, Petition Draft, Notice Draft, Complaint Draft...
}

export interface CaseFactComparison {
  feature: string;
  currentCase: string;
  referenceCase: string;
  match: boolean;
}

export interface CaseReferenceItem {
  id: string;
  caseName: string;
  citationNumber: string;
  court: string;
  judge?: string;
  year: string;
  state: string;
  bench?: string;
  caseType: string;
  similarityScore: number; // 0-100%
  factsComparison: CaseFactComparison[];
  issuesCompared: string[]; // e.g. ["Ownership", "Mutation", "Forgery", "Possession", "Survey", "Registration", "Inheritance", "Limitation"]
  legalPrinciples: string[]; // Acts, Sections, Rules, G.O.s, Circulars
  courtReasoningSummary: string;
  finalOutcome: string; // e.g. "Petition Allowed", "Mutation Restored", "Patta Cancelled", "FIR Quashed"
  whyItMatters: string;
  authoritiesCited: string[];
}

export interface Stage11PrecedentIntelligence {
  similarCasesCount: number;
  averageSimilarityScore: number;
  similarCases: CaseReferenceItem[];
  overallPrinciples: string[];
  successProbability: {
    percentage: number; // 0-100%
    rating: "Strong" | "Good" | "Moderate" | "Weak" | string; // Strong (90-100%), Good (70-89%), Moderate (50-69%), Weak (<50%)
    disclaimer: string;
  };
  authoritiesSummary: {
    supremeCourtCount: number;
    highCourtCount: number;
    governmentOrdersCount: number;
    circularsCount: number;
    statutesList: string[];
  };
  strategyRecommendationFromPrecedents: string;
}

export interface EvidenceGapItem {
  missingElement: string;
  howToObtain: string;
  urgency: "High" | "Medium" | "Low";
}

export interface CounterargumentItem {
  argument: string;
  rebuttalStrategy: string;
}

export interface AdditionalProofItem {
  type: "Document" | "Witness" | "Official Record" | "Technical Survey" | string;
  title: string;
  purpose: string;
}

export interface PriorityActionItem {
  stepNumber: number;
  action: string;
  targetAuthority: string;
  timeline: string;
}

export interface Stage12StrategySimulator {
  strongestLegalRoute: {
    routeName: string; // e.g., "Writ Petition (Article 226) before Madras High Court"
    routeType: "Civil" | "Criminal" | "Writ" | "Revenue Appeal" | "Registration Appeal" | "Consumer/Tribunal" | string;
    justification: string;
    timeToResolutionEst: string;
  };
  mostPersuasivePrecedents: string[];
  evidenceGapsToFill: EvidenceGapItem[];
  likelyOppositeCounterarguments: CounterargumentItem[];
  recommendedAdditionalProof: AdditionalProofItem[];
  priorityNextActions: PriorityActionItem[];
}

export interface ClientFacingReply {
  problemIdentified: string;
  legalPosition: string;
  immediateNextStep: string;
  expectedAuthority: string;
  estimatedTimeline: string;
}

export interface DocumentsRequired {
  mandatory: string[];
  revenue: string[];
  family: string[];
  court: string[];
  other: string[];
}

export interface ImmediateAction {
  within24Hours: string[];
  within7Days: string[];
  within30Days: string[];
}

export interface ServicePackage {
  recommendedPackage: string;
  deliverables: string[];
  professionalFee: string;
  expectedOutcome: string;
}

export interface CustomDocumentDraft {
  documentTitle: string;
  documentContent: string;
  sha256Hash?: string;
  timestamp?: string;
  verificationUrl?: string;
}

export interface PropertyEvidenceFile {
  id: string;
  name: string;
  sizeFormatted: string;
  mimeType: string;
  sha256Hash: string;
  uploadedAt: string;
  uploadedBy: string;
  virusCheckPassed: boolean;
  category: "Sale Deed" | "Patta / Chitta" | "Encumbrance Certificate (EC)" | "FMB / Survey Sketch" | "Court Order / Judgment" | "Other";
}

export interface CaseHistoryEntry {
  id: string;
  timestamp: string;
  description: string;
}

export interface PropertyCase {
  id: string;
  createdAt: string;
  rawDescription: string;
  workspace?: WorkspaceId;
  subWorkspace?: SubWorkspaceId;
  module?: ModuleId;
  engine?: AIEngineId;
  intake: IntakeData;
  stage0: IntakeData;
  stage1: Stage1Data;
  stage2: Stage2Data;
  stage3: string | Stage3LegalMap; // string for legacy property, Stage3LegalMap for detailed legal
  stage4: string | Stage4Timeline; // string for legacy property, Stage4Timeline for detailed legal
  stage5: string | Stage5RightsMatrix; // string or matrix
  stage6: Stage6Data;
  stage7: string[] | Stage7JurisdictionMap;
  stage8: Stage8Data;
  stage9: Stage9Data;
  stage10: Stage10Data;
  stage11?: Stage11PrecedentIntelligence;
  stage12?: Stage12StrategySimulator;
  clientFacingReply: ClientFacingReply;
  documentsRequired: DocumentsRequired;
  immediateAction: ImmediateAction;
  servicePackage: ServicePackage;
  customDocumentDraft: CustomDocumentDraft;
  history?: CaseHistoryEntry[];
}

export interface SavedCaseBrief {
  id: string;
  createdAt: string;
  clientName: string;
  district: string;
  category: string;
  riskScore: number;
  rootIssue: string;
}

export type PlanType = "free" | "pro" | "advocate" | "enterprise";
export type AccountStatus = "active" | "suspended" | "vip";
export type UserRole = "superadmin" | "district_admin" | "advocate" | "vao" | "surveyor" | "client" | "auditor" | "admin" | "user";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: PlanType;
  status: AccountStatus;
  role: UserRole;
  customCaseLimit?: number; // Override case limit (e.g. 10 or 9999)
  adminNotes?: string;
  createdAt: string;
  lastLoginAt: string;
  caseCount?: number;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetUserEmail: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  reason?: string;
}

