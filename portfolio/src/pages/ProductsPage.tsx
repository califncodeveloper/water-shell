import React from 'react';
import { motion } from 'framer-motion';
import { Package, Sparkles, ShieldCheck } from 'lucide-react';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { Product } from '../types';
import { fadeInUp, staggerContainer } from '../utils/animations';

interface ProductsPageProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderApp: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOrderApp,
}) => {
  return (
    <div className="pt-24 pb-16">
      {/* Top Page Header Banner */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-brand-gray border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy-muted border border-brand-navy/15 text-brand-navy text-xs font-bold tracking-wide">
              <Package className="w-3.5 h-3.5 text-brand-navy" />
              <span>Full Water Shell Catalog — 61 Active Certified Units</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy tracking-tight">
              Pure Water Solutions for <span className="text-gradient-primary">Every Home & Office</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore our laboratory-certified domestic and commercial RO water purifiers, hot & cold dispensers,
              high-pressure booster pumps, SMPS adapters, and genuine replacement filtration cartridges.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-brand-green" /> 1-Year Comprehensive Warranty
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-brand-orange" /> Tambaram Direct Hub Dispatch
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Catalog Section */}
      <FeaturedProductsSection
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onSelectProduct={onSelectProduct}
        onOrderApp={onOrderApp}
      />
    </div>
  );
};
