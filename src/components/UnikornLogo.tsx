import React from "react";

interface UnikornLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subBrandOnly?: boolean;
}

export function UnikornLogo({ className = "", size = "md", showText = true }: UnikornLogoProps) {
  let dimension = "h-9 w-9";
  if (size === "sm") dimension = "h-7 w-7";
  if (size === "lg") dimension = "h-12 w-12";
  if (size === "xl") dimension = "h-16 w-16";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Emblem matching Unikorn360 Gold Circuit Emblem */}
      <div className={`relative ${dimension} rounded-full bg-slate-950 p-0.5 border border-amber-400/80 shadow-md shadow-amber-500/10 shrink-0 group flex items-center justify-center overflow-hidden`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-amber-400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="2.5" className="opacity-90" />
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.8" className="opacity-40" />
          
          {/* Unicorn Horn */}
          <path
            d="M 32 20 L 44 32 L 38 34 Z"
            fill="currentColor"
          />
          <path
            d="M 32 20 L 40 28"
            stroke="#FEF08A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Unicorn Head Profile */}
          <path
            d="M 44 32 C 48 30 52 35 52 39 C 52 42 46 48 42 50 C 37 52 34 46 36 42 Z"
            fill="currentColor"
          />
          {/* Neck Curve */}
          <path
            d="M 42 50 C 46 56 48 64 47 72 C 46 76 43 82 38 85 C 44 83 50 75 50 66 C 50 56 46 48 42 50 Z"
            fill="currentColor"
          />

          {/* Tech Circuit Board Lines (Right side) */}
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-85">
            {/* Main Arch Circuit */}
            <path d="M 40 26 A 28 28 0 0 1 74 52" strokeWidth="1.8" />
            <circle cx="74" cy="52" r="2.5" fill="currentColor" />

            {/* Circuit Branches */}
            <path d="M 54 30 L 62 25 L 68 25" />
            <circle cx="68" cy="25" r="2" fill="currentColor" />

            <path d="M 58 36 L 66 31 L 74 31" />
            <circle cx="74" cy="31" r="2" fill="currentColor" />

            <path d="M 60 44 L 70 38 L 78 38" />
            <circle cx="78" cy="38" r="2" fill="currentColor" />

            <path d="M 58 54 L 68 48 L 76 48" />
            <circle cx="76" cy="48" r="2" fill="currentColor" />

            <path d="M 55 62 L 65 56 L 75 56" />
            <circle cx="75" cy="56" r="2" fill="currentColor" />

            <path d="M 52 70 L 62 64 L 72 64" />
            <circle cx="72" cy="64" r="2" fill="currentColor" />

            <path d="M 49 78 L 58 72 L 68 72" />
            <circle cx="68" cy="72" r="2" fill="currentColor" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 tracking-wider font-display uppercase text-sm sm:text-base">
              NILAM<span className="text-purple-700">360</span> <span className="text-[10px] text-purple-800 font-black px-1.5 py-0.5 bg-purple-100 border border-purple-300 rounded">LEGAL</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] text-slate-500 font-semibold tracking-tight">
              A Sub-brand of <strong className="text-purple-800 font-bold">UNIKORN360 AI SOLUTIONS</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
