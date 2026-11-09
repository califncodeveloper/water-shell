import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, CheckCircle2, Shield, Truck, MapPin, Smartphone, Phone, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { modalOverlayVariants, modalContentVariants, tapScale, hoverScale } from '../utils/animations';
import { ProductImageStage } from './ProductImageStage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenApp: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenApp,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!product) return null;

  const isMachine =
    product.categoryId === 'ro-water-purifiers' ||
    product.categoryId === 'water-dispensers';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <motion.div
      variants={modalOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-brand-border overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-navy px-3 py-1 bg-white rounded-full border border-slate-200">
              {product.category || 'Water Purifier'}
            </span>
            <span className="text-xs font-semibold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              In Stock
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Standardized Product Image Stage */}
            <ProductImageStage
              src={product.imageUrl}
              alt={product.name}
              categoryId={product.categoryId}
              productId={product.id}
              variant="modal"
              className="rounded-2xl border border-slate-200/80 shadow-xs"
            />

            {/* Title, Price, Description */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Product Code: {product.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy leading-snug">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-brand-navy">
                  {formattedPrice}
                </span>
                <span className="text-xs text-slate-500">Retail Incl. Taxes</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Delivery & Fulfillment Policy Badge */}
          <div
            className={`p-4 rounded-2xl border ${
              isMachine
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isMachine ? (
                <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {isMachine ? 'Direct Doorstep Machine Delivery' : 'Authorized Dealer Network Fulfillment'}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {isMachine
                    ? 'Dispatched directly from our Tambaram Main Base Hub to verified delivery zones (Chennai, Chengalpattu, Kanchipuram, and Pondicherry).'
                    : 'This accessory/filter is serviced via our network of verified local dealers for prompt pickup or technician installation.'}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">
                Technical Specifications
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-2 p-3 text-xs ${
                      index % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <span className="font-semibold text-slate-600">{spec.label}</span>
                    <span className="text-brand-navy font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-semibold text-slate-700">100% Genuine Water Shell</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-semibold text-slate-700">Full Service Warranty</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.a
              href="tel:+918825541297"
              whileHover={shouldReduceMotion ? undefined : hoverScale}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-navy bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Desk
            </motion.a>
            <motion.a
              href={`https://wa.me/918825541297?text=Hi%20Water%20Shell,%20I%20am%20interested%20in%20${encodeURIComponent(
                product.name
              )}%20(Code:%20${product.id}).%20Please%20share%20details.`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={shouldReduceMotion ? undefined : hoverScale}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </motion.a>
          </div>

          <motion.button
            onClick={() => onOpenApp(product.id)}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03, boxShadow: '0 4px 14px rgba(245, 166, 35, 0.4)' }}
            whileTap={shouldReduceMotion ? undefined : tapScale}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-sm transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Order in Water Shell App</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
