import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Users,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  hoverScale,
  tapScale,
} from '../utils/animations';

interface AboutSectionProps {
  onOpenAppModal: () => void;
  onExploreProducts: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenAppModal,
  onExploreProducts,
}) => {
  const [activeStage, setActiveStage] = useState<number>(3); // Default to RO Membrane stage
  const shouldReduceMotion = useReducedMotion();

  const filtrationStages = [
    {
      stage: '01',
      title: 'Spun Sediment Filtration',
      microns: '5 Micron',
      desc: 'High-density polypropylene spun fibers capture coarse sediment, mud, rust, silt, and suspended particles, protecting secondary filtration media.',
      icon: <Layers className="w-5 h-5 text-brand-navy" />,
    },
    {
      stage: '02',
      title: 'Coconut Shell Carbon Block',
      microns: 'High Adsorption',
      desc: 'Premium activated coconut-shell carbon absorbs dissolved chlorine, volatile organic compounds (VOCs), harsh odors, and chemical impurities.',
      icon: <Droplets className="w-5 h-5 text-brand-green" />,
    },
    {
      stage: '03',
      title: 'High-Torque Booster Pump',
      microns: '110-130 PSI',
      desc: 'Vibration-isolated heavy-duty booster pump creates the optimal hydraulic pressure required for precision osmotic separation across dense membranes.',
      icon: <Zap className="w-5 h-5 text-brand-orange" />,
    },
    {
      stage: '04',
      title: 'Thin-Film RO Membrane',
      microns: '0.0001 Micron',
      desc: 'Semi-permeable synthetic membrane rejects heavy metals, arsenic, fluorides, nitrates, and dissolved salts, handling input TDS up to 2500 ppm.',
      icon: <Activity className="w-5 h-5 text-brand-navy" />,
    },
    {
      stage: '05',
      title: 'UV-C Quartz Sterilization',
      microns: '254 nm Wave',
      desc: 'Stainless-steel UV chamber with quartz glass sleeve destroys microbiological contaminants, rendering bacteria, cysts, and viruses completely inert.',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    },
    {
      stage: '06',
      title: 'Active Copper & Alkaline',
      microns: 'pH 7.5 - 8.5',
      desc: 'Restores essential natural electrolytes (calcium, magnesium, potassium) while enriching water with trace copper ions for enhanced metabolism and natural taste.',
      icon: <Award className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-navy-muted/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Split: Mission & Brand Heritage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Left Column: Visual Story Card (5 cols) */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-brand-navy via-brand-navy-light to-brand-navy text-white p-8 sm:p-10 shadow-2xl">
              {/* Background watermark icon */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 pointer-events-none">
                <img src="/images/watershell-logo.png" alt="" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-6 relative z-10">
                <span className="text-[11px] uppercase font-extrabold tracking-widest text-brand-orange bg-white/10 px-3.5 py-1 rounded-full border border-white/15 inline-block">
                  The Water Shell Mission
                </span>

                <h3 className="text-2xl sm:text-3xl font-black leading-snug">
                  Engineering Pure Water for Every Family & Workplace
                </h3>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Water Shell bridges advanced purification science with effortless digital convenience. From high-TDS domestic reverse osmosis units to commercial dispensers and high-torque booster pumps, every system is engineered for longevity, mineral balance, and pure taste.
                </p>

                <div className="pt-4 border-t border-white/15 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-xs font-semibold text-slate-100">
                      Tambaram Central Base Logistics Origin
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                    <span className="text-xs font-semibold text-slate-100">
                      Direct Doorstep Fulfillment in 4 Major Zones
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-xs font-semibold text-slate-100">
                      Authorized Dealer Care for Instant Spares & Filters
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <motion.button
                    onClick={onOpenAppModal}
                    whileHover={shouldReduceMotion ? undefined : hoverScale}
                    whileTap={shouldReduceMotion ? undefined : tapScale}
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy-dark bg-white hover:bg-slate-100 px-4 py-2.5 rounded-xl shadow-md transition-colors"
                  >
                    <span>Discover App Benefits</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                  <button
                    onClick={onExploreProducts}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3 py-2 transition-colors"
                  >
                    <span>View 50+ Models</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Detailed Ecosystem Overview (7 cols) */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-muted text-brand-green text-xs font-bold uppercase tracking-wider">
              About Water Shell
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight leading-tight">
              A Complete Ecosystem for Clean Water, Smart Tech & Certified Service
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              At Water Shell, we recognize that water purification is not merely an appliance purchase—it is a continuous commitment to family health and operational safety. That is why we integrated our certified product line with our intuitive mobile app and physical service hubs.
            </p>

            {/* 4 Feature Pillars with Stagger */}
            <motion.div
              variants={staggerContainer(0.08, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-navy/30 transition-colors shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-navy-muted flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5 text-brand-navy" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy">Modern Purification Tech</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Multi-barrier RO, UV sterilizers, UF hollow fiber membranes, and active copper-alkaline enrichment.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-orange/30 transition-colors shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange-muted flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5 text-brand-orange" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy">Prompt Machine Delivery</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fast delivery originating from Tambaram Base Hub covering Chennai, Chengalpattu, Kanchipuram, and Pondicherry.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-green/30 transition-colors shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green-muted flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-brand-green" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy">Local Dealer Network</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Authorized neighborhood dealers ensure immediate replacement filter availability and local technician support.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/30 transition-colors shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy">Dedicated Service Desk</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Schedule technician maintenance, check warranty coverage, and access support via the app or direct helpline.
                </p>
              </motion.div>
            </motion.div>

            <div className="pt-2 flex items-center gap-4">
              <motion.button
                onClick={onExploreProducts}
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light shadow-sm transition-colors"
              >
                <span>Browse Product Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Dedicated Purity & Filtration Technology Showcase Section */}
        <div id="technology" className="pt-12 border-t border-slate-200/80">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center max-w-3xl mx-auto space-y-3 mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy text-xs font-bold uppercase tracking-wider">
              Water Science & Filtration
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Inside Water Shell Multi-Barrier Purification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Every drop is subjected to systematic micro-filtration stages designed to remove heavy metals, chemical residues, and biological contaminants while preserving essential mineral alkalinity.
            </p>
          </motion.div>

          {/* Interactive Multi-Stage Stepper Grid */}
          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtrationStages.map((stage, idx) => {
              const isSelected = activeStage === idx;
              return (
                <motion.div
                  key={stage.stage}
                  variants={fadeInUp}
                  onClick={() => setActiveStage(idx)}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-white to-slate-50 border-brand-navy shadow-card-hover ring-2 ring-brand-navy/10'
                      : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                        {stage.icon}
                      </div>
                      <span className="text-xs font-black text-slate-400 font-sans">
                        STAGE {stage.stage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-extrabold text-brand-navy">
                        {stage.title}
                      </h4>
                    </div>

                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-muted px-2 py-0.5 rounded-md mb-2">
                      Filtration: {stage.microns}
                    </span>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span className="text-brand-green flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Food Grade ABS Safe
                    </span>
                    <span className="text-brand-navy font-bold">{isSelected ? 'Active View' : 'Inspect'}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Raw vs Purified Water Comparison Banner with Staggered Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block">
                  Purity Transformation
                </span>
                <h4 className="text-lg font-black text-white">
                  Raw Borewell Water vs. Water Shell
                </h4>
                <p className="text-xs text-slate-400">
                  Calculated from standard high-salinity source water in Tamil Nadu & Puducherry regions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-300 font-bold">Unfiltered Tap / Borewell</span>
                  <span className="text-xs text-red-400 font-bold">High Risk</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>TDS Reading</span>
                    <span className="font-bold text-red-400">800 - 2500 ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taste & Clarity</span>
                    <span>Salty, Turbid</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Microbials</span>
                    <span className="text-red-400">Untreated</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-bold">Water Shell Output</span>
                  <span className="text-xs text-emerald-400 font-bold">100% Certified</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-200">
                  <div className="flex justify-between">
                    <span>TDS Reading</span>
                    <span className="font-bold text-emerald-400">25 - 50 ppm (Ideal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alkalinity</span>
                    <span className="text-emerald-300">pH 7.5 - 8.5 Balanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Microbials</span>
                    <span className="text-emerald-400">0 CFU (100% Inactivated)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
