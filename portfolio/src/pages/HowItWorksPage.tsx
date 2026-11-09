import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { useNavigate } from 'react-router-dom';

interface HowItWorksPageProps {
  onOpenAppModal: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onOpenAppModal }) => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-16">
      <section className="bg-gradient-to-b from-white via-slate-50 to-brand-gray border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-3xl space-y-4">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Simple 4-Step Process</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              From Order to First Pure Glass
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 mt-2">
              Learn how easy it is to select your purifier, complete checkout, and have certified technicians install and test water purity at your doorstep.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <HowItWorksSection
        onExploreProducts={() => navigate('/products')}
        onOpenAppModal={onOpenAppModal}
      />
    </div>
  );
};
