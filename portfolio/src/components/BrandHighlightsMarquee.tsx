import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Droplets,
  Sparkles,
  Gauge,
  Award,
  Truck,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface HighlightItem {
  icon: React.ReactNode;
  label: string;
  metric: string;
  tag: string;
}

const BRAND_HIGHLIGHTS: HighlightItem[] = [
  {
    icon: <Droplets className="w-4 h-4 text-brand-navy" />,
    label: '10-Stage RO+UV+UF+Alkaline',
    metric: '99.9% Purity',
    tag: 'Advanced Filtration',
  },
  {
    icon: <Gauge className="w-4 h-4 text-cyan-600" />,
    label: 'High TDS Input Tolerance',
    metric: 'Up to 2500 PPM',
    tag: 'All Water Sources',
  },
  {
    icon: <ShieldCheck className="w-4 h-4 text-brand-green" />,
    label: 'Comprehensive Coverage',
    metric: '1-Year Warranty',
    tag: 'Genuine Protection',
  },
  {
    icon: <Truck className="w-4 h-4 text-brand-orange" />,
    label: 'Direct Hub Dispatch',
    metric: 'Tambaram Origin',
    tag: '4 Major Base Zones',
  },
  {
    icon: <Wrench className="w-4 h-4 text-brand-navy" />,
    label: 'Doorstep Technician Service',
    metric: '60-Sec Booking',
    tag: 'Trained Experts',
  },
  {
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    label: 'Capacitive Glass UI',
    metric: 'Smart Touch Panel',
    tag: 'Modern Design',
  },
  {
    icon: <Award className="w-4 h-4 text-brand-green" />,
    label: 'Authorized Dealer Network',
    metric: '100% Genuine Spares',
    tag: 'Direct Spares',
  },
  {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    label: 'Food Grade Storage',
    metric: 'BPA-Free Polypropylene',
    tag: 'Zero Contamination',
  },
];

export const BrandHighlightsMarquee: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Double the list for seamless infinite loop
  const duplicatedHighlights = [...BRAND_HIGHLIGHTS, ...BRAND_HIGHLIGHTS];

  return (
    <div className="relative w-full py-6 bg-slate-900 border-y border-white/10 overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/60 via-slate-900 to-brand-navy/60 pointer-events-none" />

      {/* Edge gradient masks for smooth fade in/out */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div ref={containerRef} className="flex overflow-hidden">
        <motion.div
          className="flex gap-4 sm:gap-6 shrink-0 py-1"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ['0%', '-50%'],
                }
          }
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 32,
              ease: 'linear',
            },
          }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {duplicatedHighlights.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors cursor-default shrink-0 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white whitespace-nowrap">
                    {item.metric}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-brand-orange bg-brand-orange/15 px-1.5 py-0.5 rounded border border-brand-orange/20 whitespace-nowrap">
                    {item.tag}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

