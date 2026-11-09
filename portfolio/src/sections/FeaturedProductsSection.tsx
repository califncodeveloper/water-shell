import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { fadeInUp, tapScale } from '../utils/animations';

interface FeaturedProductsSectionProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderApp: (product: Product) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOrderApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [showAll, setShowAll] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    {
      id: 'ro-water-purifiers',
      name: 'RO Purifiers',
      count: products.filter((p) => p.categoryId === 'ro-water-purifiers').length,
    },
    {
      id: 'water-dispensers',
      name: 'Dispensers',
      count: products.filter((p) => p.categoryId === 'water-dispensers').length,
    },
    {
      id: 'booster-pumps',
      name: 'Booster Pumps',
      count: products.filter((p) => p.categoryId === 'booster-pumps').length,
    },
    {
      id: 'smps-power-units',
      name: 'Power Units',
      count: products.filter((p) => p.categoryId === 'smps-power-units').length,
    },
    {
      id: 'water-treatment-accessories-filters',
      name: 'Filters & Spares',
      count: products.filter((p) => p.categoryId === 'water-treatment-accessories-filters').length,
    },
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' || p.categoryId === selectedCategory;
        const matchesSearch =
          searchTerm.trim() === '' ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Featured default: prioritize Aqua Touch and flagship items
        if (a.id === 'AP-WP-061') return -1;
        if (b.id === 'AP-WP-061') return 1;
        return 0;
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Display subset or all (default 8 items)
  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, 8);

  // Find Aqua Touch for flagship banner
  const aquaTouch = useMemo(() => {
    return products.find((p) => p.id === 'AP-WP-061');
  }, [products]);

  return (
    <section id="products" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy text-xs font-bold uppercase tracking-wider">
              Authentic Product Line
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
              Featured Water Shell Catalog
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Browse authentic water purifiers, dispensers, pumps, and certified spares. Every product features verified manufacturer specifications and transparent public retail pricing.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Catalog Verification
            </span>
            <span className="text-base font-extrabold text-brand-green flex items-center gap-1.5 md:justify-end">
              <CheckCircle2 className="w-4 h-4" />
              {filteredProducts.length} Verified Products Active
            </span>
          </div>
        </motion.div>

        {/* Flagship Product Banner: Aqua Touch with Scroll Parallax Card Effect */}
        {aquaTouch && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.008 }}
            className="mb-14 bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy-dark rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10"
          >
            {/* Luminous background orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: Flagship Highlights (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange text-brand-navy-dark text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-brand-navy-dark" />
                  Flagship Spotlight • Aqua Touch (AP-WP-061)
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Aqua Touch Smart RO Purifier with Capacitive Touch Panel
                </h3>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                  {aquaTouch.description} Features multi-barrier RO+UV+UF+TDS balance, digital capacitive touch controls, real-time cartridge life indicators, 10-Litre food-grade ABS storage tank, and 1-Year Comprehensive Service Warranty.
                </p>

                {/* Key Flagship Specs Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-2xl">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-300 block">Technology</span>
                    <span className="text-xs font-bold text-white">RO + UV + UF</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-300 block">Storage</span>
                    <span className="text-xs font-bold text-white">10 Litres Tank</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-300 block">Flow Rate</span>
                    <span className="text-xs font-bold text-white">15 L / Hour</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-300 block">Max Input TDS</span>
                    <span className="text-xs font-bold text-emerald-400">2500 ppm</span>
                  </div>
                </div>

                {/* Pricing & CTA Group */}
                <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold block">
                      Public Retail Price
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
                      ₹15,999
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => onSelectProduct(aquaTouch)}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                      whileTap={shouldReduceMotion ? undefined : tapScale}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-navy hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      View Specs & Gallery
                    </motion.button>
                    <motion.button
                      onClick={() => onOrderApp(aquaTouch)}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.04, boxShadow: '0 4px 14px rgba(245, 166, 35, 0.4)' }}
                      whileTap={shouldReduceMotion ? undefined : tapScale}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-orange text-brand-navy-dark hover:bg-brand-orange-light transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span>Order on App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Illuminated Showcase Stage (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group">
                  {/* Surrounding Ambient Light Halo */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-orange/40 via-brand-green/30 to-brand-navy-light/40 rounded-[36px] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Clean, Premium White Studio Stage */}
                  <motion.div
                    onClick={() => onSelectProduct(aquaTouch)}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    className="relative w-[280px] h-[340px] sm:w-[340px] sm:h-[400px] lg:w-[360px] lg:h-[420px] bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),_0_0_35px_rgba(255,255,255,0.15)] border-2 border-white/90 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
                    title="Click to zoom Aqua Touch specifications"
                  >
                    {/* Soft stage light & floor shadow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-white pointer-events-none" />
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-slate-300/50 rounded-full blur-md pointer-events-none group-hover:w-4/5 group-hover:bg-slate-400/50 transition-all duration-300" />

                    {/* Centered High-Resolution Product Image */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src="/images/aqua-touch.jpg"
                        alt="Aqua Touch RO Purifier"
                        className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-[0_16px_28px_rgba(27,31,94,0.12)] group-hover:scale-105 transition-transform duration-500 ease-out transform-gpu"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://rukminim2.flixcart.com/image/1536/1536/xif0q/water-purifier/6/n/k/slim-glass-aquaguard-original-imah7sk3uzhx82tx.jpeg?q=90'
                          );
                        }}
                      />
                    </div>

                    {/* Top Status Pill */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-brand-green border border-emerald-200 text-[10px] font-bold shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Doorstep Ready
                      </span>
                    </div>

                    {/* Bottom Interactive Hint */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-sm group-hover:bg-brand-navy shadow-xs transition-colors">
                        <Sparkles className="w-3 h-3 text-brand-orange" />
                        Capacitive Glass Touch
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter & Search Toolbar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200/90 mb-8 space-y-4 shadow-xs"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by model, category, or features (e.g., Alkaline, Dispenser, 1 HP Pump)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-700 py-2.5 px-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 shadow-xs"
              >
                <option value="featured">Sort: Featured Spotlight</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills with animated layout pill indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 z-10 ${
                    isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 bg-brand-navy rounded-xl shadow-xs -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-white border border-slate-200 rounded-xl -z-20" />
                  )}
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Product Cards Grid with AnimatePresence */}
        {displayedProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onOrderApp={onOrderApp}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200"
          >
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-brand-navy">No products matched your query</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any products matching &ldquo;{searchTerm}&rdquo;. Try adjusting keywords or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                onSelectCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-brand-navy bg-white border border-slate-300 hover:bg-slate-100 shadow-xs"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* View All / Toggle Button */}
        {filteredProducts.length > 8 && (
          <div className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(!showAll)}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold text-brand-navy bg-brand-navy-muted hover:bg-brand-navy hover:text-white border border-brand-navy/15 transition-all shadow-sm"
            >
              <span>{showAll ? 'Show Fewer Products' : `View All ${filteredProducts.length} Verified Products`}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
};
