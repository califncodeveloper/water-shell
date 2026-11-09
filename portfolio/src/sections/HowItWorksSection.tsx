import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer, tapScale, hoverScale } from '../utils/animations';

interface HowItWorksSectionProps {
  onExploreProducts: () => void;
  onOpenAppModal: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onExploreProducts,
  onOpenAppModal,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      step: '01',
      title: 'Explore & Compare',
      description:
        'Browse our verified 50+ product catalog across RO Purifiers, Water Dispensers, Booster Pumps, SMPS Adapters, and Spares on web or mobile.',
      icon: <Search className="w-5 h-5 text-brand-navy" />,
      tag: 'Catalog Discovery',
    },
    {
      step: '02',
      title: 'Select Technology & Specs',
      description:
        'Choose the ideal filtration stages (RO+UV+UF+Alkaline), storage capacity, and flow rate tailored to your source water TDS.',
      icon: <SlidersHorizontal className="w-5 h-5 text-brand-orange" />,
      tag: 'Custom Match',
    },
    {
      step: '03',
      title: 'Order via Mobile App',
      description:
        'Verify your delivery zone with our smart address validator. Full machines qualify for direct delivery from Tambaram Hub.',
      icon: <ShoppingCart className="w-5 h-5 text-brand-green" />,
      tag: 'Instant Checkout',
    },
    {
      step: '04',
      title: 'Delivery & Certified Setup',
      description:
        'Receive prompt doorstep delivery across Chennai, Chengalpattu, Kanchipuram, and Pondicherry, supported by local dealer care.',
      icon: <Truck className="w-5 h-5 text-brand-navy" />,
      tag: 'Prompt Fulfillment',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy text-xs font-bold uppercase tracking-wider">
            Clear Customer Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            How Water Shell Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From initial product discovery to rapid doorstep installation and scheduled maintenance, we make pure water simple and dependable.
          </p>
        </motion.div>

        {/* 4 Steps Row with Connecting Line on Desktop */}
        <div className="relative">
          {/* Animated decorative line behind steps on large screens */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200/80 -translate-y-8 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="origin-left h-full bg-gradient-to-r from-brand-navy via-brand-orange to-brand-green"
            />
          </div>

          <motion.div
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          >
            {steps.map((item, index) => (
              <motion.div
                key={index}
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
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-300 font-sans group-hover:text-brand-orange transition-colors">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      {item.icon}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block mb-1.5">
                    {item.tag}
                  </span>

                  <h3 className="text-base font-extrabold text-brand-navy mb-2 group-hover:text-brand-navy-light transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                  <span>Verified Water Shell Step</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA Bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          <div>
            <h4 className="text-base sm:text-lg font-black text-brand-navy">Ready to get started?</h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Explore the full catalog or download the Android app for instant order placement and warranty registration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={onExploreProducts}
              whileHover={shouldReduceMotion ? undefined : hoverScale}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-navy bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
            >
              Explore Products
            </motion.button>
            <motion.button
              onClick={onOpenAppModal}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04, boxShadow: '0 4px 14px rgba(245, 166, 35, 0.4)' }}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Get Mobile App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
