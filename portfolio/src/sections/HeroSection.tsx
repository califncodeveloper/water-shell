import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Droplets,
  Sparkles,
  CheckCircle2,
  QrCode,
  Smartphone,
  Wrench,
  Star,
  Compass,
  Gauge,
  Activity,
  Layers,
} from 'lucide-react';
import { Product } from '../types';
import {
  staggerContainer,
  fadeInUp,
  hoverScale,
  tapScale,
} from '../utils/animations';

interface HeroSectionProps {
  flagshipProduct: Product | undefined;
  onOpenAppModal: () => void;
  onExploreProducts: () => void;
  onSelectProduct: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  flagshipProduct,
  onOpenAppModal,
  onExploreProducts,
  onSelectProduct,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax subtle transforms for background orbs (restrained for elegance)
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const handleDiscover = () => {
    const el = document.getElementById('technology') || document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const highlights = [
    {
      icon: <Droplets className="w-4 h-4 text-brand-navy" />,
      bg: 'bg-brand-navy-muted',
      border: 'hover:border-brand-navy/30',
      title: 'RO+UV+UF',
      sub: '10-Stage Purity',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-brand-green" />,
      bg: 'bg-emerald-50',
      border: 'hover:border-brand-green/30',
      title: '1-Yr Warranty',
      sub: 'Comprehensive',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-brand-orange" />,
      bg: 'bg-brand-orange-muted',
      border: 'hover:border-brand-orange/30',
      title: 'Smart Touch',
      sub: 'Capacitive UI',
    },
    {
      icon: <Gauge className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50',
      border: 'hover:border-cyan-500/30',
      title: '2500 ppm',
      sub: 'Max TDS Input',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative pt-24 pb-16 lg:pt-32 lg:pb-28 overflow-hidden bg-gradient-to-b from-brand-navy-muted/40 via-white to-brand-gray"
    >
      {/* Background Ambient Light Orbs with Parallax */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb1Y }}
        className="absolute top-12 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-brand-navy-light/10 via-brand-green/10 to-brand-orange/15 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb2Y }}
        className="absolute -top-32 left-0 w-[450px] h-[450px] bg-brand-orange-muted/30 rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Mesh */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1B1F5E 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Statement & Primary Actions (7 cols) */}
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Pill Tag */}
            <motion.div variants={fadeInUp} className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">
                  Official Water Shell Experience • 2026
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-300">|</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tambaram Hub Dispatch
                </span>
              </div>
            </motion.div>

            {/* Main Headline with word-by-word reveal */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-[1.12]"
            >
              <span>Pure Water.{' '}</span>
              <span className="text-gradient-orange inline-block">
                Smarter Living.
              </span>
            </motion.h1>

            {/* Brand Description */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Engineered for absolute purity, electrolyte balance, and modern kitchen elegance. Discover certified multi-stage RO+UV+UF filtration systems with intelligent capacitive touch controls, real-time cartridge telemetry, and trusted local dealer fulfillment.
            </motion.p>

            {/* Key Purity Highlights Bar */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-2xl mx-auto lg:mx-0"
            >
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.02 }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs ${h.border} transition-colors cursor-default`}
                >
                  <div className={`w-8 h-8 rounded-xl ${h.bg} flex items-center justify-center shrink-0`}>
                    {h.icon}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-brand-navy block leading-tight">{h.title}</span>
                    <span className="text-[10px] text-slate-500">{h.sub}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* 3 Prominent CTAs: Explore Products, Discover Water Shell, Download App */}
            <motion.div
              variants={fadeInUp}
              className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <motion.button
                onClick={onExploreProducts}
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navy-light shadow-md hover:shadow-lg transition-colors duration-200"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={handleDiscover}
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs hover:shadow transition-colors duration-200"
              >
                <Compass className="w-4 h-4 text-brand-navy" />
                <span>Discover Water Shell</span>
              </motion.button>

              <motion.button
                onClick={onOpenAppModal}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04, boxShadow: '0 6px 20px rgba(245, 166, 35, 0.4)' }}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-sm transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download App</span>
              </motion.button>
            </motion.div>

            {/* Reassurance note */}
            <motion.div
              variants={fadeInUp}
              className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
              <span>Direct doorstep delivery to Chennai, Chengalpattu, Kanchipuram & Pondicherry</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Premium Visual Centerpiece (Flagship + Interactive Telemetry) (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[360px] sm:max-w-[400px]"
            >
              {/* Radial Ambient Backlight */}
              <div className="absolute inset-0 bg-radial-glow rounded-full scale-125 opacity-90 pointer-events-none" />

              {/* Main Showcase Container with gentle floating motion */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -6, 0],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="relative bg-slate-950 rounded-[44px] p-4 shadow-[0_25px_60px_-15px_rgba(27,31,94,0.35)] border-4 border-slate-800 ring-1 ring-white/20 overflow-hidden"
              >
                {/* Luminous Glow Behind Flagship Product */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-10 left-0 w-44 h-44 bg-brand-green/20 rounded-full blur-2xl pointer-events-none" />

                {/* Top Status Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-xs">
                      <img src="/images/watershell-logo.png" alt="" className="w-5 h-5 object-contain" />
                    </div>
                    <div>
                      <span className="text-xs font-black block leading-none text-white">Water Shell</span>
                      <span className="text-[9px] text-brand-orange font-bold uppercase tracking-wider">Smart Hydro System</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Purity Online
                  </span>
                </div>

                {/* Flagship Product Showcase Box */}
                <div className="relative mt-3 p-4 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-md border border-brand-orange/20">
                      Flagship Model
                    </span>
                    <span className="text-xs font-bold text-emerald-400">In Stock • ₹15,999</span>
                  </div>

                  {/* Product Image with Interactive Hover: Clean White Studio Pedestal */}
                  <div
                    onClick={() => flagshipProduct && onSelectProduct(flagshipProduct)}
                    className="relative h-48 w-full flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-white/30 cursor-pointer group overflow-hidden"
                    title="Click to view Aqua Touch specifications"
                  >
                    {/* Soft stage light & floor shadow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-white to-white pointer-events-none" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/5 h-2.5 bg-slate-200/50 rounded-full blur-sm pointer-events-none" />

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src="/images/aqua-touch.jpg"
                        alt="Aqua Touch Smart RO Purifier"
                        className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-[0_8px_16px_rgba(27,31,94,0.1)] group-hover:scale-105 transition-transform duration-300 transform-gpu"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://rukminim2.flixcart.com/image/1536/1536/xif0q/water-purifier/6/n/k/slim-glass-aquaguard-original-imah7sk3uzhx82tx.jpeg?q=90'
                          );
                        }}
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/60 text-[9px] text-white flex items-center gap-1 group-hover:bg-brand-navy shadow-xs transition-colors">
                      <Sparkles className="w-3 h-3 text-brand-orange" />
                      <span>Touch Controls</span>
                    </div>
                  </div>

                  <h3 className="mt-2 text-sm font-black text-white leading-tight">
                    Aqua Touch Smart RO Purifier
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    10-Stage RO+UV+UF+Alkaline • Capacitive Glass Panel
                  </p>
                </div>

                {/* Real-time Telemetry & Purity Index */}
                <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-navy-light border border-white/15 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-brand-orange" />
                      Live Purity Telemetry
                    </span>
                    <span className="text-[10px] text-slate-300">RO + UV Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-slate-300 block uppercase">Purity Score</span>
                      <span className="text-xl font-black text-white font-sans">98.8%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-slate-300 block uppercase">Filtered TDS</span>
                      <span className="text-xl font-black text-emerald-400 font-sans">28 ppm</span>
                    </div>
                  </div>

                  {/* Purity Progress bar */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '96%' }}
                      transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-gradient-to-r from-brand-orange to-emerald-400 h-1.5 rounded-full"
                    />
                  </div>
                </div>

                {/* Action button in card */}
                <div className="mt-3 pt-1 flex items-center gap-2">
                  <motion.button
                    onClick={onOpenAppModal}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-brand-navy-dark font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-brand-navy-dark" />
                    <span>Download Mobile App (APK)</span>
                  </motion.button>
                  {flagshipProduct && (
                    <button
                      onClick={() => onSelectProduct(flagshipProduct)}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                      title="View specifications"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Floating Companion Pill 1: Scannable QR Code (Top-Right) */}
              <motion.div
                onClick={onOpenAppModal}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.06, y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -5, 0],
                      }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="hidden sm:flex absolute -top-5 -right-6 bg-white p-3 rounded-2xl shadow-xl border border-slate-200/90 items-center gap-3 cursor-pointer z-30"
              >
                <div className="p-1.5 bg-slate-100 rounded-xl">
                  <QrCode className="w-7 h-7 text-brand-navy" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-brand-navy">Scan to Install</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Instant APK (39 MB)</span>
                </div>
              </motion.div>

              {/* Floating Companion Pill 2: 1-Tap Technician Service (Bottom-Left) */}
              <motion.div
                onClick={onOpenAppModal}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.06, y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, 5, 0],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3 rounded-2xl shadow-xl border border-slate-200/90 items-center gap-3 cursor-pointer z-30"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-brand-orange fill-brand-orange" />
                    <span className="text-xs font-bold text-brand-navy">1-Tap Service</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Certified Technician Visit</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Verified Brand Metric Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 pt-8 border-t border-slate-200/80"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs hover:shadow-card transition-all"
            >
              <span className="text-2xl sm:text-3xl font-black text-brand-navy block font-sans">
                50+
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                Products in Catalog
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                RO Purifiers, Dispensers & Spares
              </span>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs hover:shadow-card transition-all"
            >
              <span className="text-2xl sm:text-3xl font-black text-brand-navy block font-sans">
                4 Hubs
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                Operational Base Centers
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Tambaram, Mudichur & Beyond
              </span>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs hover:shadow-card transition-all"
            >
              <span className="text-2xl sm:text-3xl font-black text-brand-green block font-sans">
                100%
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                Genuine Certified Spares
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Direct Authorized Components
              </span>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs hover:shadow-card transition-all"
            >
              <span className="text-2xl sm:text-3xl font-black text-brand-orange block font-sans">
                2500 ppm
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                TDS Handling Capability
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                High-salinity Borewell Support
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
