import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, CheckCircle2, Droplets, Smartphone } from 'lucide-react';
import { Product } from '../types';
import { tapScale } from '../utils/animations';
import { ProductImageStage } from './ProductImageStage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onOrderApp: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onOrderApp,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Formatting price to Indian Rupees
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const isMachine =
    product.categoryId === 'ro-water-purifiers' ||
    product.categoryId === 'water-dispensers';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 12 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -6,
              boxShadow:
                '0 20px 35px -8px rgba(27, 31, 94, 0.14), 0 8px 16px -4px rgba(27, 31, 94, 0.06)',
            }
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-white rounded-3xl border border-slate-200/90 shadow-card hover:border-slate-300 flex flex-col h-full overflow-hidden transition-all duration-300"
    >
      {/* Product Image Stage: standardized, centered container with white stage & intelligent scaling */}
      <ProductImageStage
        src={product.imageUrl}
        alt={product.name}
        categoryId={product.categoryId}
        productId={product.id}
        variant="card"
        className="border-b border-slate-100"
      >
        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5 z-20">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-brand-navy shadow-xs border border-slate-200/90 backdrop-blur-sm">
            {product.category || 'Water Purifier'}
          </span>
        </div>

        {/* Stock / Delivery Status Badge */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-brand-green border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            In Stock
          </span>
        </div>

        {/* Delivery zone indicator for machines */}
        {isMachine && (
          <div className="absolute bottom-2.5 left-3.5 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-brand-navy/90 text-white backdrop-blur-xs shadow-xs">
              Doorstep Hub Delivery
            </span>
          </div>
        )}
      </ProductImageStage>

      {/* Product Information Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          {/* Model ID tag */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
            <span>{product.id}</span>
            <span className="text-brand-green font-medium">Verified Genuine</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm sm:text-base font-black text-brand-navy group-hover:text-brand-navy-light transition-colors line-clamp-1 cursor-pointer min-h-[1.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {product.description}
          </p>

          {/* Key Spec Highlights */}
          <div className="mt-3 flex flex-wrap gap-1.5 min-h-[1.75rem]">
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.slice(0, 2).map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200/60"
                >
                  <Droplets className="w-2.5 h-2.5 text-brand-navy/60" />
                  <span className="truncate max-w-[130px]">{spec.value}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 font-medium border border-slate-100">
                Genuine Certified Unit
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
              Public Retail
            </span>
            <span className="text-base sm:text-lg font-black text-brand-navy font-sans tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              onClick={() => onSelect(product)}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="p-2 rounded-xl text-slate-600 hover:text-brand-navy bg-slate-100 hover:bg-slate-200 transition-colors"
              title="View full product specifications & warranty"
              aria-label="View product details"
            >
              <Eye className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => onOrderApp(product)}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { scale: 1.04, boxShadow: '0 4px 12px rgba(27, 31, 94, 0.2)' }
              }
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white hover:bg-brand-navy-light shadow-xs transition-colors"
            >
              <span>Order</span>
              <Smartphone className="w-3 h-3 text-brand-orange" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
