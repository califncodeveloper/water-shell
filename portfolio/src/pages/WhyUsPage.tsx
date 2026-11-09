import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { WhyChooseSection } from '../sections/WhyChooseSection';
import { fadeInUp, staggerContainer } from '../utils/animations';

export const WhyUsPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <section className="bg-gradient-to-b from-white via-slate-50 to-brand-gray border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-3xl space-y-4">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-brand-orange-dark text-xs font-bold tracking-wide mb-3">
              <Award className="w-3.5 h-3.5 text-brand-orange" />
              <span>Engineered For Reliability</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              Why 10,000+ Families Choose Water Shell
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 mt-2">
              From our direct Tambaram dispatch hub to our 48-hour service guarantee, discover the advantages that make Water Shell Chennai's most trusted water brand.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <WhyChooseSection />
    </div>
  );
};
