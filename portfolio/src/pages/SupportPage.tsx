import React from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import { CustomerSupportSection } from '../sections/CustomerSupportSection';
import { fadeInUp, staggerContainer } from '../utils/animations';

export const SupportPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <section className="bg-gradient-to-b from-white via-slate-50 to-brand-gray border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-3xl space-y-4">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-brand-green text-xs font-bold tracking-wide mb-3">
              <Headphones className="w-3.5 h-3.5" />
              <span>Prompt Local Care</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              Customer Support & Physical Hubs
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 mt-2">
              Reach our dedicated sales and escalation desks, or visit our physical hubs in Tambaram, Mudichur, and Guduvanchery.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <CustomerSupportSection />
    </div>
  );
};
