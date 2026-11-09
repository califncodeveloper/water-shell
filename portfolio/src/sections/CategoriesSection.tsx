import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Droplets, GlassWater, Gauge, Zap, Layers, CheckCircle } from 'lucide-react';
import { OFFICIAL_CATEGORIES } from '../data/categories';
import { ProductCategoryItem } from '../types';
import { fadeInUp, staggerContainer, tapScale } from '../utils/animations';

interface CategoriesSectionProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectCategory }) => {
  const shouldReduceMotion = useReducedMotion();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-brand-navy" />;
      case 'GlassWater':
        return <GlassWater className="w-5 h-5 text-brand-orange" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5 text-brand-green" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-brand-orange" />;
      case 'Layers':
      default:
        return <Layers className="w-5 h-5 text-brand-navy" />;
    }
  };

  return (
    <section id="categories" className="py-20 lg:py-28 bg-brand-gray relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange-muted text-brand-orange text-xs font-bold uppercase tracking-wider">
            Official Catalog Range
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            Explore 5 Certified Product Categories
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From intelligent capacitive-touch domestic purifiers to commercial hot & cold dispensers and precision booster pumps, browse certified equipment engineered for Indian source water.
          </p>
        </motion.div>

        {/* 5 Categories Grid with Staggered Entrance */}
        <motion.div
          variants={staggerContainer(0.09, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {OFFICIAL_CATEGORIES.map((cat: ProductCategoryItem, index: number) => {
            const isFeatured = index === 0; // Highlight RO Water Purifiers
            const fallbackImage = index === 0 ? '/images/aqua-touch.jpg' : cat.image;

            return (
              <motion.div
                key={cat.id}
                variants={fadeInUp}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -6,
                        boxShadow: '0 20px 35px -8px rgba(27, 31, 94, 0.14), 0 8px 16px -4px rgba(27, 31, 94, 0.06)',
                      }
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`group bg-white rounded-3xl border flex flex-col overflow-hidden transition-colors ${
                  isFeatured
                    ? 'border-brand-navy/30 shadow-card-hover md:col-span-2 lg:col-span-1 ring-1 ring-brand-navy/10'
                    : 'border-slate-200/80 shadow-card hover:border-slate-300'
                }`}
              >
                {/* Image & Header Banner */}
                <div className="relative h-52 bg-gradient-to-b from-slate-100 to-slate-50 overflow-hidden flex items-center justify-center">
                  {/* Subtle radial glow on card header */}
                  <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />

                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 relative z-10"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', fallbackImage);
                    }}
                  />

                  {/* Category Model Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-navy shadow-sm backdrop-blur-sm border border-slate-200">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Icon Circle */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center shadow-sm backdrop-blur-sm z-20 group-hover:scale-110 transition-transform duration-200">
                    {getIcon(cat.iconName)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Category 0{index + 1}
                      </span>
                      <span className="text-[11px] font-bold text-brand-green">
                        Verified Specs
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-brand-navy group-hover:text-brand-navy-light transition-colors">
                      {cat.name}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-100">
                      {cat.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <motion.button
                      onClick={() => onSelectCategory(cat.id)}
                      whileTap={shouldReduceMotion ? undefined : tapScale}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-brand-navy bg-brand-navy-muted/60 hover:bg-brand-navy hover:text-white transition-all flex items-center justify-center gap-2 group-hover:bg-brand-navy group-hover:text-white shadow-xs"
                    >
                      <span>Explore All {cat.shortName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
