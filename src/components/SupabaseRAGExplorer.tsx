import React, { useState, useEffect } from "react";
import { 
  Database, Sparkles, Code, Terminal, Check, Copy, Search, HelpCircle, 
  ChevronRight, ArrowRight, ShieldCheck, Play, Layers, Info, CheckCircle, 
  AlertTriangle, BookOpen, Clock, FileText, ArrowLeft, RefreshCw, Key
} from "lucide-react";
import { TN_DISTRICTS } from "../data/constants";

// SQL DDL Script for Supabase PostgreSQL with Vector capabilities
const SQL_SCHEMA = `-- =========================================================================
-- UNIKORN360 PROPERTY CASE SOLVING SYSTEM
-- Supabase PostgreSQL Vector Database Schema for RAG (Retrieval-Augmented Generation)
-- Optimized for similarity search & context injection of precedent property disputes
-- =========================================================================

-- 1. Enable pgvector extension for vector embeddings storage and operations
create extension if not exists vector;

-- 2. Define historical case precedents table
create table public.cases_rag_library (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    district text not null,                 -- e.g., 'Madurai', 'Thanjavur', 'Coimbatore'
    case_category text not null,            -- e.g., 'Revenue', 'Registration', 'Family / Inheritance', 'Government Land'
    property_type text not null,            -- e.g., 'Ancestral Wet Agricultural Land', 'Urban Residential Plot'
    root_issue text not null,               -- e.g., 'Unauthorised Settlement Deed', 'UDR Survey Error'
    risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
    remedy_track text not null,             -- e.g., 'Objection to SRO under Sec 77A', 'Patta Appeal to RDO'
    case_summary text not null,             -- Detailed facts and background of the dispute
    key_documents text[] not null,          -- List of critical evidence docs, e.g., ['Parent Deed', 'Patta']
    case_outcome text not null,             -- Successful outcome/judgement description
    metadata jsonb default '{}'::jsonb      -- Flexible JSON payload for extraneous parameters
);

-- 3. Define content chunk embeddings table for fine-grained semantic retrieval
create table public.case_embeddings (
    id uuid default gen_random_uuid() primary key,
    case_id uuid references public.cases_rag_library(id) on delete cascade not null,
    content_chunk text not null,            -- Segmented text that gets converted to embedding
    embedding vector(1536) not null,        -- 1536 dimensions (compatible with OpenAI text-embedding-3-small)
    chunk_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create traditional index structures to speed up exact attribute queries
create index cases_rag_library_district_idx on public.cases_rag_library (district);
create index cases_rag_library_category_idx on public.cases_rag_library (case_category);
create index cases_rag_library_risk_idx on public.cases_rag_library (risk_score);

-- 5. Create HNSW (Hierarchical Navigable Small World) index for lightning-fast Cosine similarity search
create index case_embeddings_hnsw_idx on public.case_embeddings 
using hnsw (embedding vector_cosine_ops);

-- 6. Enable Row Level Security (RLS) for data governance
alter table public.cases_rag_library enable row level security;
alter table public.case_embeddings enable row level security;

-- 7. Define RLS Policies
-- Allow read-only access to any user (for RAG context generation)
create policy "Allow read-only public access to cases_rag_library" 
on public.cases_rag_library for select using (true);

create policy "Allow read-only public access to case_embeddings" 
on public.case_embeddings for select using (true);

-- Restrict modification privileges to authenticated administrators only
create policy "Allow admin write access to cases_rag_library" 
on public.cases_rag_library for all using (auth.role() = 'authenticated');

create policy "Allow admin write access to case_embeddings" 
on public.case_embeddings for all using (auth.role() = 'authenticated');

-- 8. Create a search RPC function that calculates similarity and supports filtering
create or replace function public.match_historical_cases (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_district text default null,
  filter_category text default null,
  min_risk_score int default 0
)
returns table (
  id uuid,
  case_id uuid,
  title text,
  district text,
  case_category text,
  property_type text,
  root_issue text,
  risk_score int,
  remedy_track text,
  case_summary text,
  key_documents text[],
  case_outcome text,
  content_chunk text,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    ce.id,
    ce.case_id,
    c.title,
    c.district,
    c.case_category,
    c.property_type,
    c.root_issue,
    c.risk_score,
    c.remedy_track,
    c.case_summary,
    c.key_documents,
    c.case_outcome,
    ce.content_chunk,
    1 - (ce.embedding <=> query_embedding) as similarity -- Cosine similarity calculation
  from public.case_embeddings ce
  join public.cases_rag_library c on ce.case_id = c.id
  where 
    (1 - (ce.embedding <=> query_embedding)) >= match_threshold
    and (filter_district is null or c.district = filter_district)
    and (filter_category is null or c.case_category = filter_category)
    and (c.risk_score >= min_risk_score)
  order by ce.embedding <=> query_embedding asc -- Ascending order of vector distance (closest first)
  limit match_count;
end;
$$;`;

interface HistoricalCasePrecedent {
  id: string;
  title: string;
  district: string;
  category: string;
  propertyType: string;
  rootIssue: string;
  riskScore: number;
  remedyTrack: string;
  caseSummary: string;
  keyDocuments: string[];
  caseOutcome: string;
  keywords: string[];
}

// 5 Curated Tamil Nadu precedent cases with realistic vectors & key attributes
const HISTORICAL_LIBRARY: HistoricalCasePrecedent[] = [
  {
    id: "precedent_001",
    title: "மதுரை பூர்வீக சொத்து பத்திரம் போலிப்பதிவு",
    district: "Madurai",
    category: "Registration",
    propertyType: "Ancestral Agricultural Land",
    rootIssue: "பரஸ்பர ஒப்புதல் இன்றி பிரிக்கப்படாத பூர்வீக சொத்துக்கு போலி செட்டில்மெண்ட் பத்திரம் பதிவு",
    riskScore: 85,
    remedyTrack: "பிரிவு 77A பதிவுச் சட்டம் - மாவட்ட பதிவாளர் (District Registrar) போலிப்பத்திர ரத்து மனு",
    caseSummary: "மேலூர் வட்டத்தில் உள்ள 3.5 ஏக்கர் பூர்வீக நிலம். தந்தை உயில் இன்றி இறந்தார். பிற வாரிசுகளின் (சகோதரிகள்) அனுமதியின்றி மூத்த மகன் தனியாக தனது மனைவிக்கு செட்டில்மெண்ட் பத்திரம் பதிவு செய்தார். போலி ஆவணம் தயாரித்தல் குற்றச்சாட்டு.",
    keyDocuments: ["தாய் பத்திரம் (1974)", "வாரிசு சான்றிதழ்", "வில்லங்க சான்றிதழ் (EC)", "அடங்கல் / சிட்டா நகல்"],
    caseOutcome: "மாவட்ட பதிவாளர் விரிவான விசாரணைக்குப் பின் பிரிவு 77A-இன் கீழ் போலி செட்டில்மெண்ட் பத்திரத்தை ரத்து செய்து உத்தரவிட்டார். சார்பதிவாளர் (SRO) பதிவேட்டில் திருத்தம் செய்யப்பட்டு, அசல் உரிமை நிலுவை வாரிசுகளுக்கு மீட்கப்பட்டது.",
    keywords: ["போலி", "செட்டில்மெண்ட்", "வாரிசு", "77A", "ரத்து", "அனுமதி", "மதுரை", "மேலூர்", "பத்திரம்", "உயில்"]
  },
  {
    id: "precedent_002",
    title: "தஞ்சாவூர் பட்டா யுடிஆர் முரண்பாடு & எல்லை ஆக்கிரமிப்பு",
    district: "Thanjavur",
    category: "Revenue",
    propertyType: "Wet Agricultural Land",
    rootIssue: "யுடிஆர் (UDR) சர்வே பிழையால் பட்டா தவறாக பக்கத்து நில உரிமையாளர் பெயருக்கு மாறியது",
    riskScore: 65,
    remedyTrack: "பட்டா மேல்முறையீடு மனு - வருவாய் கோட்டாட்சியர் (Revenue Divisional Officer - RDO)",
    caseSummary: "தாத்தா காலத்து 2.2 ஏக்கர் நன்செய் நிலம். UDR திட்டத்தின் போது சர்வே எண் 89/1A தவறுதலாக பக்கத்து வீட்டுக்காரர் பெயரில் பதிவு செய்யப்பட்டது. வில்லங்கம் ஏதுமின்றி 1985 முதல் வரி ரசீதுகள் மற்றும் பாகப்பிரிவினை பத்திரம் இருந்தும் சர்வே துறையின் பிழை.",
    keyDocuments: ["பாகப்பிரிவினை பத்திரம் (1985)", "வரி ரசீதுகள் (1985-2020)", "UDR அ-பதிவேடு நகல்", "FMB சர்வே வரைபடம்"],
    caseOutcome: "வருவாய் கோட்டாட்சியர் (RDO) ஆவணங்களை ஆய்வு செய்து, சர்வே துறையின் UDR பதிவை எழுத்துப்பிழை என அறிவித்தார். வட்டாட்சியருக்கு (Tahsildar) அ-பதிவேடு மற்றும் பட்டாவில் திருத்தம் செய்ய உத்தரவு வழங்கி அசல் உரிமையாளருக்கு பட்டா வழங்கப்பட்டது.",
    keywords: ["யுடிஆர்", "UDR", "சர்வே", "அ-பதிவேடு", "RDO", "வட்டாட்சியர்", "வரி ரசீது", "தஞ்சாவூர்", "பட்டா", "பாகப்பிரிவினை"]
  },
  {
    id: "precedent_003",
    title: "திருவள்ளூர் லேஅவுட் வீட்டு மனை பொதுப்பாதை ஆக்கிரமிப்பு",
    district: "Tiruvallur",
    category: "Litigation",
    propertyType: "Urban Residential Plot",
    rootIssue: "அங்கீகரிக்கப்பட்ட லேஅவுட் பொதுப்பாதையை பக்கத்து விவசாயி கல்வேலி அமைத்து அடைத்தது",
    riskScore: 72,
    remedyTrack: "உரிமையியல் வழக்கு - மாவட்ட முunsிப் நீதிமன்றம் (District Munsif Court) நிரந்தர தடையுத்தரவு",
    caseSummary: "2012 இல் வாங்கப்பட்ட DTCP அங்கீகரிக்கப்பட்ட வீட்டு மனை. மனைக்குச் செல்லும் 30 அடி அகல பொதுப்பாதையை பக்கத்து விவசாயி தனது பட்டா நிலம் எனக்கூறி தென்னை மரங்கள் நட்டும், கம்பி வேலி அமைத்தும் ஆக்கிரமித்தார்.",
    keyDocuments: ["கிரைய பத்திரம் (2012)", "DTCP அங்கீகரிக்கப்பட்ட லேஅவுட் வரைபடம்", "வருவாய் துறை FMB வரைபடம்", "அளவையர் வரைபடம்"],
    caseOutcome: "மாவட்ட முனிசிப் நீதிமன்றம் சிவில் வழக்கில் ஆவணங்களை ஏற்றுக்கொண்டு, பொதுப்பாதையை ஆக்கிரமிப்பது சட்டவிரோதம் என அறிவித்து, ஆக்கிரமிப்புகளை அகற்றவும், நிரந்தர தடையுத்தரவு (Permanent Injunction) வழங்கியும் உத்தரவிட்டது.",
    keywords: ["பொதுப்பாதை", "வழித்தடம்", "DTCP", "ஆக்கிரமிப்பு", "முன்சீப்", "நீதிமன்றம்", "தடையுத்தரவு", "வழக்கு", "திருவள்ளூர்", "லேஅவுட்"]
  },
  {
    id: "precedent_004",
    title: "சென்னை கூட்டுப்பட்டா உட்பிரிவு சர்ச்சை & அத்துமீறல்",
    district: "Chennai",
    category: "Revenue",
    propertyType: "Urban Residential Plot",
    rootIssue: "கூட்டுப்பட்டாவில் உள்ள பிற பங்குகாரர்களின் ஒப்புதல் இன்றி தனிப்பட்டா கோரி அத்துமீறல்",
    riskScore: 55,
    remedyTrack: "உட்பிரிவு ஆட்சேபனை மனு - வட்டாட்சியர் (Tahsildar) அளவை ஆட்சேபனை",
    caseSummary: "சென்னையின் புறநகரில் உள்ள 2400 சதுர அடி கூட்டு நிலம். பிற வாரிசுகள் கூட்டுப்பட்டாவில் இருக்கும்போதே, ஒரு பங்குகாரர் போலி எல்கை எல்லைகளை காட்டி வட்டாட்சியரிடம் தனிப்பட்டா வழங்க உட்பிரிவு அளவை செய்ய முயற்சித்தல்.",
    keyDocuments: ["கூட்டுப்பட்டா", "அசல் கிரைய பத்திரம் (1995)", "ஏற்கனவே உள்ள முத்திரை வரைபடம்", "முன்னாள் வரி ரசீதுகள்"],
    caseOutcome: "உட்பிரிவு அளவை செய்ய வந்தபோது வட்டாட்சியரிடம் முறையான ஆட்சேபனை மனு சமர்ப்பிக்கப்பட்டது. வட்டாட்சியர் சர்வேயரை நிறுத்தி, அனைத்து கூட்டு பட்டாதாரர்களின் ஒப்புதல் மற்றும் முறையான பாகப்பிரிவினை இன்றி தனிப்பட்டா வழங்க முடியாது என மறுத்துவிட்டார்.",
    keywords: ["கூட்டுப்பட்டா", "உட்பிரிவு", "ஆட்சேபனை", "வட்டாட்சியர்", "அளவையர்", "ஒப்புதல்", "பாகப்பிரிவினை", "சென்னை", "தனிப்பட்டா"]
  },
  {
    id: "precedent_005",
    title: "கோயம்புத்தூர் போலி வாரிசு சான்றிதழ் வழி சொத்து முறைகேடு",
    district: "Coimbatore",
    category: "Registration",
    propertyType: "Family Residential House",
    rootIssue: "தவறான தகவல்கள் தந்து வட்டாட்சியரிடம் போலி வாரிசு சான்றிதழ் பெற்று சொத்து விற்பனை செய்ய முயற்சி",
    riskScore: 90,
    remedyTrack: "வாரிசு சான்றிதழ் ரத்து மனு - வருவாய் கோட்டாட்சியர் (RDO) & மாவட்ட ஆட்சியர் முறையீடு",
    caseSummary: "தந்தையின் மறைவுக்கு பின், மாற்றாந்தாய் வாரிசு சான்றிதழில் முதல் மனைவியின் குழந்தைகளை மறைத்து, வட்டாட்சியரிடம் போலி வாரிசு சான்றிதழ் பெற்று, சொத்தை முழுவதுமாக விற்க ஒப்பந்தம் செய்தார்.",
    keyDocuments: ["உண்மையான பிறப்புச் சான்றிதழ்கள்", "மரணச் சான்றிதழ்", "வட்டாட்சியர் வழங்கிய வாரிசு சான்றிதழ் நகல்", "குடும்ப அட்டை நகல்"],
    caseOutcome: "RDO மற்றும் மாவட்ட ஆட்சியரிடம் உண்மையான வாரிசுகளின் ஆவணங்களுடன் மனு தாக்கல் செய்யப்பட்டது. RDO போலி வாரிசு சான்றிதழை ரத்து செய்து, உண்மையான வாரிசு சான்றிதழ் வழங்க உத்தரவிட்டார். SRO-விடம் விற்பனை ஒப்பந்தம் ரத்து செய்யப்பட்டது.",
    keywords: ["வாரிசு சான்றிதழ்", "போலி", "ரத்து", "RDO", "ஆட்சியர்", "முறைகேடு", "விற்பனை", "கோயம்புத்தூர்", "மறைத்து", "தாய்"]
  }
];

export function SupabaseRAGExplorer() {
  const [activeTab, setActiveTab] = useState<"schema" | "simulator" | "context" | "security">("schema");
  const [copied, setCopied] = useState(false);
  
  // Simulator states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchResults, setSearchResults] = useState<{ precedent: HistoricalCasePrecedent; score: number }[]>([]);
  const [simulationStep, setSimulationStep] = useState(0);
  const [selectedResult, setSelectedResult] = useState<HistoricalCasePrecedent | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Predefined prompt helper queries
  const sampleQueries = [
    { text: "சகோதரி ஒப்புதல் இல்லாமல் போலி செட்டில்மெண்ட் பத்திரம் பதிவு செய்யப்பட்டுள்ளது", category: "Registration", district: "Madurai" },
    { text: "UDR சர்வே பிழையால் பட்டா பெயர் மாறி பக்கத்து வீட்டுக்காரர் வேலி அமைக்கிறார்", category: "Revenue", district: "Thanjavur" },
    { text: "லேஅவுட் பொதுப்பாதையை பக்கத்து விவசாயி கம்பி வேலி நட்டு ஆக்கிரமிப்பு செய்துள்ளார்", category: "Litigation", district: "Tiruvallur" },
    { text: "வட்டாட்சியரிடம் பெண் பிள்ளைகளை மறைத்து வாங்கிய போலி வாரிசு பத்திரம் விற்பனைக்கு", category: "Registration", district: "Coimbatore" },
    { text: "கூட்டுப்பட்டாவில் தனிப்பட்டா கோரி வட்டாட்சியர் அளவைக்கு ஆட்சேபனை செய்தல்", category: "Revenue", district: "Chennai" }
  ];

  const handleRunSimulation = (queryToUse?: string, districtToUse?: string, categoryToUse?: string) => {
    const query = queryToUse !== undefined ? queryToUse : searchQuery;
    const district = districtToUse !== undefined ? districtToUse : selectedDistrict;
    const category = categoryToUse !== undefined ? categoryToUse : selectedCategory;

    if (!query.trim()) return;

    setIsSimulating(true);
    setSimulationStep(1);
    setSearchResults([]);
    setSelectedResult(null);

    // Step-by-step pipeline visualization
    setTimeout(() => {
      setSimulationStep(2); // Semantic vector calculation
      
      setTimeout(() => {
        setSimulationStep(3); // HNSW Index Cosine Distance calculation
        
        setTimeout(() => {
          // Calculate a mock cosine similarity score based on overlapping keywords
          const queryTokens = query.toLowerCase().split(/[\s,.\-/?!]+/);
          
          const scored = HISTORICAL_LIBRARY.map(prec => {
            // Base similarity
            let matchCount = 0;
            queryTokens.forEach(token => {
              if (token.length > 2) {
                // Check if in keywords
                if (prec.keywords.some(k => k.toLowerCase().includes(token) || token.includes(k.toLowerCase()))) {
                  matchCount += 1.5;
                }
                // Check in title or summary
                if (prec.title.toLowerCase().includes(token)) matchCount += 1.0;
                if (prec.caseSummary.toLowerCase().includes(token)) matchCount += 0.5;
                if (prec.rootIssue.toLowerCase().includes(token)) matchCount += 0.5;
              }
            });

            // Adjust by attribute filter
            let multiplier = 1.0;
            if (district !== "All" && prec.district.toLowerCase() === district.toLowerCase()) {
              multiplier += 0.2;
            }
            if (category !== "All" && prec.category.toLowerCase() === category.toLowerCase()) {
              multiplier += 0.3;
            }

            // Map match count to a realistic cosine similarity percentage [0.65 - 0.98]
            let score = 0.55 + (Math.min(matchCount, 8) / 8) * 0.38;
            score = Math.min(score * multiplier, 0.985);
            
            // Random jitter
            score += (Math.random() - 0.5) * 0.02;
            score = parseFloat(score.toFixed(4));

            return { precedent: prec, score };
          })
          .filter(item => {
            // Filter by District
            if (district !== "All" && item.precedent.district !== district) return false;
            // Filter by Category
            if (category !== "All" && item.precedent.category !== category) return false;
            return true;
          })
          .sort((a, b) => b.score - a.score);

          setSearchResults(scored);
          if (scored.length > 0) {
            setSelectedResult(scored[0].precedent);
          }
          setSimulationStep(4); // Displaying Top Matches
          setIsSimulating(false);
        }, 800);
      }, 700);
    }, 600);
  };

  // Auto-run simulator on mount with first sample
  useEffect(() => {
    setSearchQuery(sampleQueries[0].text);
    handleRunSimulation(sampleQueries[0].text, "All", "All");
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-3xs">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none font-display">Supabase PostgreSQL RAG வடிவமைப்பு</h2>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[8px] rounded-full uppercase tracking-wider">
                VECTORS & pgvector
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Unikorn360 சொத்து வழக்குகளின் துல்லியமான தீர்வுகளுக்காக Supabase-இல் தரவுத்தள கட்டமைப்பு மற்றும் சிமுலேட்டர்.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Selectors */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-3xs">
        {[
          { key: "schema", label: "PostgreSQL DDL ஸ்கிரிப்ட்", icon: Code },
          { key: "simulator", label: "RAG வெக்டர் தேடல் சிமுலேட்டர்", icon: Sparkles },
          { key: "context", label: "Gemini சூழல் உட்செலுத்துதல்", icon: BookOpen },
          { key: "security", label: "வழக்கு பாதுகாப்பு (RLS Policies)", icon: ShieldCheck }
        ].map((tb) => {
          const isSelected = activeTab === tb.key;
          const Icon = tb.icon;
          return (
            <button
              key={tb.key}
              onClick={() => setActiveTab(tb.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                isSelected 
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PostgreSQL DDL Schema */}
      {activeTab === "schema" && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 font-medium leading-relaxed">
              <strong className="block mb-0.5">சுபாபேஸ் RAG உகப்பாக்கம் (Supabase RAG Optimization):</strong>
              இந்த ஸ்கிரிப்ட் <code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-700">pgvector</code> நீட்டிப்பை முழுமையாகப் பயன்படுத்துகிறது. வரலாற்று வழக்கு முன்னோடிகளைச் சேமித்து, அதிவேகமாக தேடுவதற்கு <code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-700">HNSW (Hierarchical Navigable Small World)</code> குறியீட்டையும், உள்ளூர் வட்டாட்சியர்/பதிவாளர் ஆட்சேபனைக்கான RPC செயல்பாட்டையும் உள்ளடக்கியுள்ளது.
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-250 shadow-inner bg-slate-900">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">நகலெடுக்கப்பட்டது!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>SQL-ஐ நகலெடு</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-950 px-4 py-2 text-[10px] text-slate-500 font-mono border-b border-slate-800 flex justify-between items-center">
              <span>UNIKORN360_RAG_SCHEMA.sql</span>
              <span className="text-indigo-400">Supabase SQL Editor Ready</span>
            </div>

            <pre className="p-5 overflow-auto text-xs font-mono text-slate-300 max-h-[480px] leading-relaxed scrollbar-thin">
              {SQL_SCHEMA}
            </pre>
          </div>

          {/* Database Relations Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-slate-500" />
              அட்டவணை கட்டமைப்புகள் & உறவுகள் (Entity Relations)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 font-mono">1. cases_rag_library</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded-full">Primary Source</span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                  வரலாற்று வழக்குகள், நீதிமன்ற முன்னோடிகள், வட்டாட்சியர் உத்தரவுகள் மற்றும் அவற்றின் இறுதி தீர்வு முடிவுகள் ஆகியவற்றைச் சேமிக்கிறது.
                </p>
                <div className="space-y-1 font-mono text-[10px] text-slate-600 border-t border-slate-200 pt-2">
                  <div className="flex justify-between"><span className="font-bold">id</span><span>UUID (PK)</span></div>
                  <div className="flex justify-between"><span>title / district / case_category</span><span>TEXT</span></div>
                  <div className="flex justify-between"><span>property_type / root_issue</span><span>TEXT</span></div>
                  <div className="flex justify-between"><span>risk_score</span><span>INTEGER [0-100]</span></div>
                  <div className="flex justify-between"><span>remedy_track / case_summary</span><span>TEXT</span></div>
                  <div className="flex justify-between"><span>key_documents</span><span>TEXT[] (ARRAY)</span></div>
                  <div className="flex justify-between"><span>case_outcome</span><span>TEXT</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 font-mono">2. case_embeddings</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold rounded-full">Vector Chunk Store</span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                  வழக்குகளின் விரிவான சுருக்கங்களை சிறு உரைத் தொகுதிகளாக மாற்றி, அவற்றின் வெக்டர் மதிப்புகளை (embeddings) சேமிக்கிறது.
                </p>
                <div className="space-y-1 font-mono text-[10px] text-slate-600 border-t border-slate-200 pt-2">
                  <div className="flex justify-between"><span className="font-bold">id</span><span>UUID (PK)</span></div>
                  <div className="flex justify-between"><span className="text-indigo-600">case_id</span><span>UUID (FK ➔ cases_rag_library)</span></div>
                  <div className="flex justify-between"><span>content_chunk</span><span>TEXT</span></div>
                  <div className="flex justify-between"><span className="text-amber-600 font-bold">embedding</span><span>VECTOR(1536)</span></div>
                  <div className="flex justify-between"><span>chunk_index</span><span>INTEGER</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RAG Vector Search Similarity Simulator */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 font-medium leading-relaxed">
              <strong className="block mb-0.5">ஊடாடும் வெக்டர் ஒற்றுமை சிமுலேட்டர் (Interactive Vector Similarity Simulator):</strong>
              இங்கு நீங்கள் உங்களின் தற்போதைய சொத்து வழக்கின் விவரங்களை உள்ளிடலாம். சிமுலேட்டர் உங்களின் உரையிலிருந்து முக்கியமான கருத்துக்களைப் பிரித்து, எங்களின் மாதிரி சுபாபேஸ் வெக்டர் தரவுத்தளத்தில் சேமிக்கப்பட்டுள்ள வழக்கு முன்னோடிகளுடன் ஒப்பிட்டு, <strong>Cosine Similarity Score</strong> கணக்கிடும்.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input controller left panel (5 columns) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">RAG உள்ளீடு அளவுருக்கள்</span>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">மாதிரி வினவல்கள் (அதிவேக தேர்வு):</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {sampleQueries.map((sq, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(sq.text);
                          setSelectedCategory(sq.category);
                          // Auto run
                          handleRunSimulation(sq.text, "All", sq.category);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-[11px] font-semibold transition border ${
                          searchQuery === sq.text
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="px-1.5 py-0.5 bg-slate-200/60 text-[9px] font-extrabold rounded mr-1.5 text-slate-600">
                          {sq.category}
                        </span>
                        {sq.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">சொத்து சிக்கலின் தனிப்பயன் உரை:</label>
                  <textarea
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="எ.கா., எனது பூர்வீக நிலத்தை வட்டாட்சியர் தவறாக வேறொருவர் பெயருக்கு மாற்றிவிட்டார்..."
                    className="w-full p-3 text-xs font-semibold bg-white border border-slate-250 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition min-h-[100px]"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">வகை வடிகட்டி (Category):</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 text-xs font-semibold bg-white border border-slate-250 rounded-lg cursor-pointer"
                    >
                      <option value="All">அனைத்தும் (All)</option>
                      <option value="Revenue">வருவாய் (Revenue)</option>
                      <option value="Registration">பதிவு (Registration)</option>
                      <option value="Litigation">நீதிமன்றம் (Litigation)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">மாவட்டம் (District):</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full p-2 text-xs font-semibold bg-white border border-slate-250 rounded-lg cursor-pointer"
                    >
                      <option value="All">அனைத்தும் (All)</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Thanjavur">Thanjavur</option>
                      <option value="Tiruvallur">Tiruvallur</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunSimulation()}
                  disabled={isSimulating || !searchQuery.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>வெக்டர் கணக்கிடப்படுகிறது...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>சிமுலேட்டர் இயக்கு (Search Vector)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation pipeline output right panel (7 columns) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl min-h-[380px] flex flex-col justify-between">
              
              {/* Simulation steps animation visualizer */}
              {simulationStep === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <Database className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-xs text-slate-400 font-bold italic">
                    சிமுலேஷனைத் தொடங்க இடது பக்கமுள்ள "இயக்கு" பொத்தானை அழுத்தவும்.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  
                  {/* Process flow indicator */}
                  <div className="grid grid-cols-4 gap-1 border-b border-slate-100 pb-3">
                    {[
                      { num: 1, label: "உரை உள்ளீடு" },
                      { num: 2, label: "1536 EMB" },
                      { num: 3, label: "HNSW குறியீடு" },
                      { num: 4, label: "வெற்றிடத் தேடல்" }
                    ].map((step) => {
                      const isActive = simulationStep >= step.num;
                      const isCurrent = simulationStep === step.num;
                      return (
                        <div key={step.num} className="text-center">
                          <span className={`inline-block w-5 h-5 rounded-full text-[10px] font-bold leading-tight ${
                            isCurrent 
                              ? "bg-indigo-600 text-white animate-pulse" 
                              : isActive 
                                ? "bg-emerald-500 text-white" 
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}>
                            {step.num}
                          </span>
                          <span className={`block text-[9px] font-black uppercase mt-1 ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Processing Status Updates */}
                  {simulationStep === 1 && (
                    <div className="p-8 text-center space-y-2">
                      <Terminal className="h-8 w-8 text-indigo-500 animate-bounce mx-auto" />
                      <p className="text-xs font-mono text-slate-600">CLIENT_QUERY_INTENT_TOKENIZING...</p>
                      <p className="text-[11px] text-slate-400">உரையின் முக்கிய சொற்கள் மற்றும் சட்டக் கருத்துக்கள் குறியாக்கப்படுகின்றன.</p>
                    </div>
                  )}

                  {simulationStep === 2 && (
                    <div className="p-8 text-center space-y-2">
                      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                      <p className="text-xs font-mono text-indigo-600">CALLING_EMBEDDING_MODEL_1536_DIM...</p>
                      <p className="text-[11px] text-slate-400">உரை 1536-பரிமாணங்கள் கொண்ட மிதவைப் புள்ளிகளின் வெக்டராக மாற்றப்படுகிறது.</p>
                    </div>
                  )}

                  {simulationStep === 3 && (
                    <div className="p-8 text-center space-y-2">
                      <Layers className="h-8 w-8 text-amber-500 animate-pulse mx-auto" />
                      <p className="text-xs font-mono text-amber-600">QUERYING_SUPABASE_HNSW_INDEX_USING_COSINE_DISTANCE...</p>
                      <p className="text-[11px] text-slate-400">சுபாபேஸ் HNSW குறியீட்டின் உதவியோடு தூரம் கணக்கிடப்பட்டு ஒப்பிடப்படுகிறது.</p>
                    </div>
                  )}

                  {simulationStep === 4 && (
                    <div className="space-y-4">
                      
                      {/* Search matches results */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                          நெருங்கிய வெக்டர் பொருத்தம் (Top Semantic Matches)
                        </span>
                        
                        {searchResults.length === 0 ? (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 italic">
                            வடிகட்டிகளின் கீழ் எந்தவொரு வரலாற்று வழக்கு முன்கூட்டியும் பொருந்தவில்லை.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {searchResults.map((res, idx) => {
                              const isSelected = selectedResult?.id === res.precedent.id;
                              // Colors
                              const simPercent = Math.round(res.score * 100);
                              let simColor = "text-rose-600 bg-rose-50 border border-rose-100";
                              if (simPercent > 85) simColor = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                              else if (simPercent > 70) simColor = "text-indigo-700 bg-indigo-50 border border-indigo-100";

                              return (
                                <div
                                  key={res.precedent.id}
                                  onClick={() => setSelectedResult(res.precedent)}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                                    isSelected 
                                      ? "bg-slate-50 border-indigo-600 ring-1 ring-indigo-500/20" 
                                      : "bg-white border-slate-200 hover:border-slate-350"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 rounded">
                                        {res.precedent.category}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400">
                                        {res.precedent.district} • Risk: {res.precedent.riskScore}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-black text-slate-800 truncate">{res.precedent.title}</h5>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{res.precedent.rootIssue}</p>
                                  </div>

                                  <div className={`px-2.5 py-1.5 rounded-xl text-center shrink-0 ${simColor}`}>
                                    <span className="text-xs font-black block leading-none">{simPercent}%</span>
                                    <span className="text-[8px] font-bold block mt-0.5 uppercase tracking-wide">ஒற்றுமை</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Display detail of selected match precedent */}
                      {selectedResult && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                            <h6 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">மீட்கப்பட்ட முந்தைய தீர்ப்பின் விபரம் (Precedent Details)</h6>
                          </div>

                          <div className="text-xs space-y-2">
                            <div>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase block">சட்ட வழிப்பாதை (Remedy Track):</span>
                              <span className="font-bold text-indigo-700">{selectedResult.remedyTrack}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase block">சுருக்கம் (Summary of Facts):</span>
                              <p className="text-slate-600 leading-normal font-semibold mt-0.5">"{selectedResult.caseSummary}"</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase block">தேவைப்பட்ட ஆவணங்கள் (Required Docs):</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedResult.keyDocuments.map((doc, idx) => (
                                  <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-semibold">{doc}</span>
                                ))}
                              </div>
                            </div>
                            <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-lg">
                              <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">வழக்கு தீர்வு மற்றும் முடிவு (Outcome):</span>
                              <p className="text-emerald-950 font-bold leading-normal mt-0.5">"{selectedResult.caseOutcome}"</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* RAG pipeline explainer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  சுபாபேஸில் Cosine Distance ஆபரேட்டர் <code>&lt;=&gt;</code> மூலம் இயங்குகிறது.
                </span>
                <span className="font-bold text-indigo-600">Supabase pgvector API</span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 3: Prompt Context Injection Showcase */}
      {activeTab === "context" && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 font-medium leading-relaxed">
              <strong className="block mb-0.5">சூழல் உட்செலுத்துதல் (Context Injection for RAG):</strong>
              வெக்டர் தேடலில் இருந்து பெறப்பட்ட முந்தைய தீர்ப்புகள் மற்றும் தமிழ்நாடு நில வருவாய் ஒழுங்குமுறைகள், கீழே காட்டப்பட்டுள்ளபடி <strong>Gemini LLM Prompt</strong>-இன் ஒரு பகுதியாக உட்செலுத்தப்படுகின்றன. இதன் மூலம் மாடல் தவறான தகவல்களைத் தருவது தடுக்கப்பட்டு, 100% அதிகாரப்பூர்வமான சட்ட வழிகாட்டுதல் உறுதி செய்யப்படுகிறது.
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-4.5 w-4.5 text-indigo-600" />
                மாடலுக்கு அனுப்பப்படும் உட்செலுத்தப்பட்ட ப்ராம்ப்ட் வடிவம் (System Prompt Mockup)
              </span>
              <span className="text-[9px] font-extrabold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">LLM Payload</span>
            </div>

            <div className="space-y-3 font-mono text-[11px] leading-relaxed bg-slate-950 text-slate-300 p-5 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
              <p className="text-indigo-400"># SYSTEM INSTRUCTION</p>
              <p className="pl-3 text-slate-400">You are the legal AI of Unikorn360. Ground all responses in the official precedent cases and regulatory context provided below.</p>
              
              <p className="text-indigo-400 mt-4"># INJECTED CONTEXT (RETRIEVED FROM SUPABASE VECTOR DB)</p>
              <div className="pl-3 py-2 border-l-2 border-indigo-500 bg-indigo-950/40 text-slate-300 space-y-2">
                <p className="font-bold text-amber-400">--- PRECEDENT CASE #1: {selectedResult?.title || "மதுரை பூர்வீக சொத்து பத்திரம் போலிப்பதிவு"}</p>
                <p><strong>District:</strong> {selectedResult?.district || "Madurai"} | <strong>Category:</strong> {selectedResult?.category || "Registration"}</p>
                <p><strong>Root Issue:</strong> {selectedResult?.rootIssue || "அனுமதியின்றி போலி பத்திரம் பதிவு"}</p>
                <p><strong>Summary:</strong> {selectedResult?.caseSummary || " sibling executed unauthorized settlement deed without consensus. Handled under Sec 77A."}</p>
                <p><strong>Remedy Track:</strong> {selectedResult?.remedyTrack || "Sec 77A Cancellation petition to DR"}</p>
                <p><strong>Successful Outcome:</strong> {selectedResult?.caseOutcome || "The District Registrar cancelled the forged deed and updated SRO indexes."}</p>
              </div>

              <p className="text-indigo-400 mt-4"># USER CASE DETAILS</p>
              <div className="pl-3 text-slate-300">
                <p><strong>Client:</strong> {searchQuery ? searchQuery.slice(0, 40) + "..." : "சகோதரி ஒப்புதல் இன்றி பத்திரம் பதிவு செய்யப்பட்டுள்ளது..."}</p>
                <p><strong>Current District:</strong> {selectedDistrict === "All" ? "Tamil Nadu General" : selectedDistrict}</p>
              </div>

              <p className="text-indigo-400 mt-4"># TASK</p>
              <p className="pl-3 text-slate-400">Analyze the client's case and draft the exact objection petition. Map the remedy steps directly based on the successful precedents provided above. Avoid any generic civil litigation advice if administrative remedies exist.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Row Level Security */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 font-medium leading-relaxed">
              <strong className="block mb-0.5">ரோ-லெவல் செக்யூரிட்டி கொள்கைகள் (Row Level Security Policies):</strong>
              வாடிக்கையாளர்களின் சொத்து விவரங்கள் மற்றும் ஆவண வரைபடங்களின் ரகசியத்தன்மை மிக முக்கியமானவை. சுபாபேஸ்-இல் உள்ள ஆர்.எல்.எஸ் (RLS) கொள்கைகள் மூலம், ஒவ்வொரு பயனரும் தங்களின் சொந்த வழக்குகளை மட்டுமே படிக்க அல்லது எழுத முடியும் என்பதை உறுதி செய்கிறது.
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="h-4.5 w-4.5 text-slate-500" />
              வாடிக்கையாளர் தனிப்பட்ட தரவு பாதுகாப்பு கொள்கை (User Data Isolation RLS)
            </h4>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              சுபாபேஸில் உள்ள பொதுவான பயனர் வழக்கு அட்டவணைக்கு (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">public.client_cases</code>) பயன்படுத்தப்படும் பாதுகாப்புக் கொள்கை பின்வருமாறு அமைய வேண்டும்:
            </p>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
              <span className="text-slate-500">-- 1. client_cases அட்டவணையில் RLS ஐச் செயல்படுத்தவும்</span><br />
              <span className="text-indigo-400">alter table</span> public.client_cases <span className="text-indigo-400">enable row level security</span>;<br /><br />

              <span className="text-slate-500">-- 2. உள்நுழைந்துள்ள பயனர் தனது சொந்த கோப்புகளை மட்டுமே படிக்க அனுமதிக்கவும்</span><br />
              <span className="text-indigo-400">create policy</span> "Users can read their own cases"<br />
              <span className="text-indigo-400">on</span> public.client_cases<br />
              <span className="text-indigo-400">for select</span><br />
              <span className="text-indigo-400">using</span> ( auth.uid() = user_id );<br /><br />

              <span className="text-slate-500">-- 3. பயனர்கள் தங்கள் வழக்குகளை மட்டுமே சேர்க்க அல்லது புதுப்பிக்க அனுமதிக்கவும்</span><br />
              <span className="text-indigo-400">create policy</span> "Users can insert their own cases"<br />
              <span className="text-indigo-400">on</span> public.client_cases<br />
              <span className="text-indigo-400">for insert</span><br />
              <span className="text-indigo-400">with check</span> ( auth.uid() = user_id );<br /><br />

              <span className="text-indigo-400">create policy</span> "Users can update their own cases"<br />
              <span className="text-indigo-400">on</span> public.client_cases<br />
              <span className="text-indigo-400">for update</span><br />
              <span className="text-indigo-400">using</span> ( auth.uid() = user_id );
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs font-bold text-slate-700 block mb-1">auth.uid() ஒப்பீடு</span>
                <p className="text-[10px] text-slate-400 font-medium">ஒவ்வொரு வரிசையிலும் உள்ள user_id-ஐ Supabase Auth-இன் தனிப்பட்ட பயனர் ஐடியுடன் ஒப்பிடுகிறது.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs font-bold text-slate-700 block mb-1">தானியங்கி வடிகட்டுதல்</span>
                <p className="text-[10px] text-slate-400 font-medium">சுபாபேஸ் கிளைண்ட் வினவல்களில் தானாகவே பில்டர் சேர்க்கப்படுவதால் தரவு கசிவு தடுக்கப்படுகிறது.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs font-bold text-slate-700 block mb-1">நிர்வாகிகள் அனுமதிகள்</span>
                <p className="text-[10px] text-slate-400 font-medium">நிர்வாகிகள் (Super Users) முழுமையாக அணுகுவதற்கு தனி Service-Role கீ கொள்கைகளை வழங்கலாம்.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
