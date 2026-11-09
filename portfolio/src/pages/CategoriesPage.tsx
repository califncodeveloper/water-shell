import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { CategoriesSection } from '../sections/CategoriesSection';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { useNavigate } from 'react-router-dom';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    navigate('/products');
  };

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
              <Layers className="w-3.5 h-3.5" />
              <span>5 Certified Product Verticals</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              Engineered Product Categories
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 mt-2">
              Browse our complete lineup across residential purification, workplace dispensing, high-pressure boosting, and genuine maintenance parts.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <CategoriesSection onSelectCategory={handleCategorySelect} />
    </div>
  );
};
