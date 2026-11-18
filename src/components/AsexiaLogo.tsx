import React from 'react';

interface AsexiaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
}

export const AsexiaLogo: React.FC<AsexiaLogoProps> = ({
  className = '',
  size = 44,
  showText = false,
  textColor = 'text-white',
  subtextColor = 'text-slate-400',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Exact Circular 3D Ribbon Emblem matching the uploaded logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-[0_4px_16px_rgba(2,132,199,0.35)]"
      >
        <defs>
          {/* Outer Ring Gradient: Sapphire Blue to Teal to Vibrant Lime Green */}
          <linearGradient id="asexiaOuterRing" x1="0.1" y1="0.9" x2="0.9" y2="0.1">
            <stop offset="0%" stopColor="#003B7A" />
            <stop offset="35%" stopColor="#0284C7" />
            <stop offset="65%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>

          {/* Inner Circle Radial Highlight */}
          <radialGradient id="asexiaInnerBg" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </radialGradient>

          {/* Blue Ribbon Front Gradient */}
          <linearGradient id="asexiaBlueGrad" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="40%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#003875" />
          </linearGradient>

          {/* Blue Ribbon Fold/Shadow Gradient */}
          <linearGradient id="asexiaBlueDark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#002855" />
            <stop offset="100%" stopColor="#001833" />
          </linearGradient>

          {/* Green Leaf Ribbon Gradient */}
          <linearGradient id="asexiaGreenGrad" x1="0" y1="0.3" x2="1" y2="0.7">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="60%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>

          {/* Green Leaf Underside/Fold Shadow */}
          <linearGradient id="asexiaGreenDark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>

          {/* 3D Drop Shadows */}
          <filter id="asexiaDropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="2" dy="5" stdDeviation="6" floodColor="#001E3D" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* 1. Outer Gradient Ring */}
        <circle cx="250" cy="250" r="236" fill="url(#asexiaOuterRing)" />

        {/* Outer Ring Inner Bevel Edge */}
        <circle cx="250" cy="250" r="222" fill="#002D5E" opacity="0.3" />

        {/* 2. Inner White Luminous Base */}
        <circle cx="250" cy="250" r="218" fill="url(#asexiaInnerBg)" />

        {/* Subtle inner circular specular reflection */}
        <path
          d="M 60 220 A 210 210 0 0 1 440 220 A 200 180 0 0 0 60 220 Z"
          fill="#FFFFFF"
          opacity="0.4"
        />

        {/* 3. The 3D Ribbon Letter "A" Group */}
        <g filter="url(#asexiaDropShadow)">
          {/* Blue Left Arch & Apex (Main Body) */}
          {/* Left leg goes from (70, 360) up to apex around (250, 100) */}
          <path
            d="M 70 360 
               L 165 360 
               L 260 170 
               L 310 230 
               L 365 230 
               L 265 100 
               C 255 88 238 88 228 100 
               L 70 360 Z"
            fill="url(#asexiaBlueGrad)"
          />

          {/* Blue Apex Inner Fold Shadow (creates the 3D twist) */}
          <path
            d="M 235 96 
               C 246 88 260 92 268 104 
               L 365 230 
               L 318 230 
               L 248 135 
               C 242 125 235 110 235 96 Z"
            fill="url(#asexiaBlueDark)"
            opacity="0.9"
          />

          {/* Right Leg of A (Blue lower fold) */}
          <path
            d="M 310 300 
               L 390 300 
               L 425 360 
               L 340 360 
               Z"
            fill="url(#asexiaBlueGrad)"
          />

          {/* Right Leg Top Shadow */}
          <path
            d="M 310 300 
               L 390 300 
               L 375 320 
               L 310 320 
               Z"
            fill="url(#asexiaBlueDark)"
            opacity="0.4"
          />

          {/* Green Leaf Horizontal Crossbar (Top Layer of Fold) */}
          <path
            d="M 195 292 
               C 220 236 295 236 415 236 
               C 385 270 320 292 195 292 Z"
            fill="url(#asexiaGreenGrad)"
          />

          {/* Green Leaf Underside Ribbon (3D depth fold) */}
          <path
            d="M 305 292 
               C 360 292 410 270 415 236 
               C 405 285 365 300 305 292 Z"
            fill="url(#asexiaGreenDark)"
          />
        </g>
      </svg>

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-2xl sm:text-3xl tracking-tight leading-none ${textColor}`}>
              Asexia
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
          </div>
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${subtextColor}`}>
            TECNOLOGÍA QUE IMPULSA TU NEGOCIO
          </span>
        </div>
      )}
    </div>
  );
};
