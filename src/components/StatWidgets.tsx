import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Scale, FileText, IndianRupee } from "lucide-react";
import { PropertyCase } from "../types";

interface StatWidgetsProps {
  cases: PropertyCase[];
  onSelectCase: (id: string) => void;
}

export function StatWidgets({ cases, onSelectCase }: StatWidgetsProps) {
  // Compute analytics
  const totalCases = cases.length;
  
  const totalFees = cases.reduce((acc, c) => {
    const feeStr = c.servicePackage?.professionalFee || "0";
    const matches = feeStr.match(/(\d[\d,]*)/g);
    if (matches && matches.length > 0) {
      const val = parseInt(matches[0].replace(/,/g, ""), 10);
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);

  const averageRisk = totalCases > 0 
    ? Math.round(cases.reduce((acc, c) => acc + (c.stage9?.score || 0), 0) / totalCases)
    : 0;

  // Breakdown of case categories
  const categories: Record<string, number> = {};
  cases.forEach(c => {
    const cat = c.stage1?.category || "Other";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const categoryList = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    percentage: totalCases > 0 ? Math.round((count / totalCases) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Stat Card 1: Total Cases */}
      <div id="stat-card-total" className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-purple-100 text-purple-800 border border-purple-200 rounded-xl shrink-0">
          <Scale className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">செயலில் உள்ள வழக்குகள்</p>
          <p className="text-2xl font-black text-slate-900 leading-tight font-display">{totalCases}</p>
        </div>
      </div>

      {/* Stat Card 2: Projected Fees */}
      <div id="stat-card-fees" className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl shrink-0">
          <IndianRupee className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">எதிர்பார்க்கப்படும் கட்டணங்கள்</p>
          <p className="text-2xl font-black text-slate-900 leading-tight font-display">
            ₹{totalFees.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Stat Card 3: Avg Risk */}
      <div id="stat-card-risk" className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className={`p-3 rounded-xl shrink-0 ${
          averageRisk > 60 ? "bg-rose-100 text-rose-800 border border-rose-200" : averageRisk > 30 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
        }`}>
          <AlertTriangle className="h-5.5 w-5.5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">சராசரி அச்சுறுத்தல் வீதம்</p>
          <p className="text-2xl font-black text-slate-900 leading-tight font-display">{averageRisk}%</p>
        </div>
      </div>

      {/* Stat Card 4: Category Distribution Visual */}
      <div id="stat-card-distribution" className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 pl-1">பிரிவுகளின் வரைபடம்</p>
        {totalCases === 0 ? (
          <p className="text-xs text-slate-500 italic pl-1">புள்ளிவிவரங்கள் இன்னும் கிடைக்கவில்லை.</p>
        ) : (
          <div className="space-y-1.5 pl-1">
            {categoryList.slice(0, 2).map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 leading-none mb-1">
                  <span className="truncate max-w-[120px]">{cat.name}</span>
                  <span>{cat.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full ${idx === 0 ? 'bg-purple-700' : 'bg-amber-500'}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RiskGaugeProps {
  score: number;
  rating: string;
}

export function RiskGauge({ score, rating }: RiskGaugeProps) {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; 
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-emerald-600";
  let bgGradient = "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (score > 80) {
    colorClass = "stroke-rose-600";
    bgGradient = "bg-rose-50 border-rose-200 text-rose-900";
  } else if (score > 60) {
    colorClass = "stroke-rose-500";
    bgGradient = "bg-rose-50 border-rose-200 text-rose-900";
  } else if (score > 40) {
    colorClass = "stroke-amber-500";
    bgGradient = "bg-amber-50 border-amber-200 text-amber-900";
  } else if (score > 20) {
    colorClass = "stroke-sky-500";
    bgGradient = "bg-sky-50 border-sky-200 text-sky-900";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4.5 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">நிலை 09 - அச்சுறுத்தல் மதிப்பீடு</h3>
      
      <div className="relative w-36 h-20 flex justify-center items-end overflow-hidden">
        <svg className="absolute top-0 w-32 h-32 transform -rotate-180" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>

        <div className="flex flex-col items-center justify-end pb-1 z-10">
          <span className="text-3xl font-black text-slate-900 leading-none font-display">{score}</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">100-க்கு</span>
        </div>
      </div>

      <div className={`mt-3 px-3.5 py-1 rounded-full text-[10px] font-extrabold border ${bgGradient} text-center shadow-xs uppercase tracking-wider`}>
        அச்சுறுத்தல் அளவு: {rating}
      </div>
    </div>
  );
}
