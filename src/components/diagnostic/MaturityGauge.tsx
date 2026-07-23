import React from 'react';
import { motion } from 'framer-motion';

interface MaturityGaugeProps {
  score: number;
}

export const MaturityGauge: React.FC<MaturityGaugeProps> = ({ score }) => {
  // Determine premium gradient colors based on score range
  let gradientColors = { start: '#ef4444', end: '#f97316' }; // Critical
  if (score >= 25) gradientColors = { start: '#f97316', end: '#f59e0b' }; // Low-mid
  if (score >= 50) gradientColors = { start: '#f59e0b', end: '#10b981' }; // Mid-high (Amber to Emerald)
  if (score >= 75) gradientColors = { start: '#3b82f6', end: '#10b981' }; // Advanced (Blue to Emerald)

  // Primary branding color for text
  let color = '#ef4444';
  if (score >= 25) color = '#f97316';
  if (score >= 50) color = '#eab308';
  if (score >= 75) color = '#3b82f6';
  if (score >= 90) color = '#10b981';

  // Semicircle path (Meia Lua): Starts at (22, 100) and ends at (178, 100) with radius 78
  // This forms a perfectly symmetric semicircular gauge arc.
  const pathD = "M 22 100 A 78 78 0 0 1 178 100";

  return (
    <div className="relative w-full max-w-[260px] mx-auto flex flex-col items-center">
      {/* Aspect ratio 200:120 is aspect-[5/3] */}
      <svg viewBox="0 0 200 120" className="w-full aspect-[5/3] overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
        </defs>

        {/* Soft zones (5 segments of 18% with 2% gap - reduced width and opacity for minimal premium aesthetic) */}
        <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" pathLength="100" strokeDasharray="18 82" strokeDashoffset="0" />
        <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" pathLength="100" strokeDasharray="18 82" strokeDashoffset="-20" />
        <path d={pathD} fill="none" stroke="#eab308" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" pathLength="100" strokeDasharray="18 82" strokeDashoffset="-40" />
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" pathLength="100" strokeDasharray="18 82" strokeDashoffset="-60" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" pathLength="100" strokeDasharray="18 82" strokeDashoffset="-80" />

        {/* Main Background Track - Sleek dark slate color */}
        <path 
          d={pathD}
          fill="none" 
          stroke="#1E293B" 
          strokeWidth="8" 
          strokeLinecap="round"
        />

        {/* Value Track - Animated with premium linear gradient */}
        <motion.path 
          d={pathD}
          fill="none" 
          stroke="url(#gaugeGradient)" 
          strokeWidth="8" 
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - score }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Labels drawn inside the SVG coordinate space - perfectly aligned and clear */}
        <text 
          x="22" 
          y="114" 
          fill="currentColor" 
          fontSize="7" 
          fontWeight="bold"
          className="text-muted-foreground/50"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          CRÍTICO
        </text>
        
        <text 
          x="178" 
          y="114" 
          fill="currentColor" 
          fontSize="7" 
          fontWeight="bold"
          className="text-muted-foreground/50"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          AVANÇADO
        </text>

        {/* Score number inside the gauge - prominent and perfectly centered */}
        <text 
          x="100" 
          y="80" 
          fill={color} 
          fontSize="46" 
          fontWeight="900"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {score}
        </text>

        {/* Score label inside the gauge */}
        <text 
          x="100" 
          y="95" 
          fill="currentColor" 
          fontSize="8" 
          fontWeight="bold"
          className="text-muted-foreground/60"
          letterSpacing="1"
          textAnchor="middle"
        >
          SCORE GERAL
        </text>
      </svg>
    </div>
  );
};
