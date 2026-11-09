import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { AppShowcaseSection } from '../sections/AppShowcaseSection';
import { fadeInUp, staggerContainer } from '../utils/animations';

interface AppShowcasePageProps {
  onOpenAppModal: (productId?: string) => void;
}

export const AppShowcasePage: React.FC<AppShowcasePageProps> = ({ onOpenAppModal }) => {
  return (
    <div className="pt-24 pb-16">
      <section className="bg-gradient-to-b from-white via-slate-50 to-brand-gray border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-3xl space-y-4">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy-muted border border-brand-navy/15 text-brand-navy text-xs font-bold tracking-wide mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Available for Android & iOS</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              Water Shell Mobile App
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 mt-2">
              Browse products, track live dispatch from Tambaram, book certified maintenance visits, and connect with authorized local dealers right from your phone.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <AppShowcaseSection onOpenAppModal={onOpenAppModal} />
    </div>
  );
};
