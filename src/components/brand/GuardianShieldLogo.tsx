import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export const GuardianShieldLogo: React.FC<LogoProps> = ({
  className = '',
  size = 36,
  showTagline = false,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Shield Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-teal-600 to-blue-700 shadow-md shadow-cyan-900/30 p-2 text-white"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white drop-shadow"
        >
          {/* Outer Shield Outline */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Inner Layered Stack Line (Continuity) */}
          <path d="M12 8v8" strokeWidth="2" stroke="rgba(255,255,255,0.9)" />
          <path d="M8 12h8" strokeWidth="2" stroke="rgba(255,255,255,0.9)" />
        </svg>
        {/* Glow indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold tracking-wider text-base md:text-lg text-slate-900 dark:text-white">
            GUARDIAN
          </span>
          <span className="font-extrabold tracking-wider text-base md:text-lg text-teal-600 dark:text-teal-400">
            STACK
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Every policy. Every record. Every family, protected.
          </span>
        )}
      </div>
    </div>
  );
};
