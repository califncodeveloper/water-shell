import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, ShieldCheck, FileText, Truck } from 'lucide-react';
import { modalOverlayVariants, modalContentVariants } from '../utils/animations';

export type LegalModalType = 'privacy' | 'terms' | 'delivery' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const shouldReduceMotion = useReducedMotion();

  if (!type) return null;

  return (
    <motion.div
      variants={modalOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-brand-border overflow-hidden my-8 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-brand-green" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-brand-navy" />}
            {type === 'delivery' && <Truck className="w-5 h-5 text-brand-orange" />}
            <h3 className="text-base sm:text-lg font-extrabold text-brand-navy">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
              {type === 'delivery' && 'Delivery, Fulfillment & Warranty Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p className="font-semibold text-slate-800">Effective Date: January 2026</p>
              <p>
                Water Shell (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy outlines how we handle personal data collected via the Water Shell portfolio website and mobile application.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">1. Information We Collect</h4>
              <p>
                When you create an account, browse products, or place an order through our mobile application, we collect essential delivery information including your name, delivery address, phone number, and email. For registered dealers, business credentials such as GSTIN and shop address are retained for account verification.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">2. How We Use Information</h4>
              <p>
                Information is strictly used to fulfill water purifier deliveries, schedule technician service appointments, dispatch replacement filters via authorized dealers, and send important service notifications.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">3. Data Security & Storage</h4>
              <p>
                We use Google Firebase cloud infrastructure with strict Firestore Security Rules. We do not sell, rent, or lease customer data to third-party advertisers.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">4. Contact</h4>
              <p>
                For privacy inquiries or account data deletion requests, contact our primary helpline desk at +91 88255 41297 or email support@watershell.in.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p className="font-semibold text-slate-800">Effective Date: January 2026</p>
              <p>
                Welcome to Water Shell. By accessing our portfolio website or ordering via our Android application, you agree to comply with and be bound by the following terms.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">1. Authenticity of Equipment & Spares</h4>
              <p>
                All RO water purifiers, water dispensers, booster pumps, SMPS adapters, and filter cartridges listed on Water Shell are authentic, certified products. Unauthorized reproduction of product designs or proprietary media is strictly prohibited.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">2. Pricing & Orders</h4>
              <p>
                Prices shown on this portfolio website are public retail prices (inclusive of GST). Authorized dealers who are verified and approved by the Water Shell administrative desk receive wholesale pricing when signed into the mobile application.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">3. Mobile Application</h4>
              <p>
                The Water Shell mobile app (com.watershell.app) provides real-time ordering, live order progress tracking, and 1-tap service booking. Users must provide valid contact numbers and delivery addresses to ensure proper logistics routing.
              </p>
            </>
          )}

          {type === 'delivery' && (
            <>
              <p className="font-semibold text-slate-800">Effective Date: January 2026</p>
              <h4 className="font-bold text-brand-navy text-sm">1. Direct Doorstep Machine Delivery</h4>
              <p>
                Water Shell operates a direct fulfillment hub originating from our Tambaram Central Base Center. All RO Water Purifiers and Water Dispensers are delivered directly by our dedicated logistics team to the following 4 primary zones:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><span className="font-semibold">Zone 1: Chennai Metropolitan Area</span> (Tambaram, Chromepet, Guindy, Velachery, OMR, etc.) – Within 24 Hours.</li>
                <li><span className="font-semibold">Zone 2: Chengalpattu District</span> (Chengalpattu town, Maraimalai Nagar, Guduvanchery) – Within 24-48 Hours.</li>
                <li><span className="font-semibold">Zone 3: Kanchipuram District</span> (Kanchipuram, Walajabad, Sriperumbudur) – Within 24-48 Hours.</li>
                <li><span className="font-semibold">Zone 4: Pondicherry / Puducherry UT</span> (Puducherry, Ozhukarai, Villianur) – Scheduled Delivery within 48-72 Hours.</li>
              </ul>
              <h4 className="font-bold text-brand-navy text-sm pt-2">2. Complimentary Technician Installation</h4>
              <p>
                Every domestic RO machine delivered to the 4 primary zones includes certified complimentary technician installation, including wall-mount bracket fitting, inlet water diverter hookup, and initial TDS balance verification.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">3. Spares & Accessories Fulfillment</h4>
              <p>
                Replacement filter sets, booster pumps, and SMPS adapters are fulfilled immediately through our network of authorized local dealers in your neighborhood, preventing delivery waiting times.
              </p>
              <h4 className="font-bold text-brand-navy text-sm pt-2">4. 1-Year Comprehensive Warranty</h4>
              <p>
                All new domestic RO purifiers are protected by a 1-Year Comprehensive Service Warranty covering electrical components, booster pumps, and SMPS power units against manufacturing defects.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-brand-navy bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Document
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
