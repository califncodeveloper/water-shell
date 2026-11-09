import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Truck, ArrowLeft } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { Link, useNavigate } from 'react-router-dom';

export type PolicyType = 'privacy' | 'terms' | 'delivery';

interface LegalPageProps {
  type: PolicyType;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-brand-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/70">
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                {type === 'privacy' && <ShieldCheck className="w-6 h-6 text-brand-green" />}
                {type === 'terms' && <FileText className="w-6 h-6 text-brand-navy" />}
                {type === 'delivery' && <Truck className="w-6 h-6 text-brand-orange" />}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
                  {type === 'privacy' && 'Privacy Policy'}
                  {type === 'terms' && 'Terms & Conditions'}
                  {type === 'delivery' && 'Delivery, Fulfillment & Warranty Policy'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Legal Document • Effective January 2026
                </p>
              </div>
            </motion.div>
          </div>

          {/* Content Body */}
          <motion.div
            variants={fadeInUp}
            className="p-6 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed"
          >
            {type === 'privacy' && (
              <>
                <p>
                  Water Shell (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy outlines how we handle personal data collected via the Water Shell portfolio website and mobile application.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">1. Information We Collect</h2>
                <p>
                  When you create an account, browse products, or place an order through our mobile application, we collect essential delivery information including your name, delivery address, phone number, and email. For registered dealers, business credentials such as GSTIN and shop address are retained for account verification.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">2. How We Use Information</h2>
                <p>
                  Information is strictly used to fulfill water purifier deliveries, schedule technician service appointments, dispatch replacement filters via authorized dealers, and send important service notifications.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">3. Data Security & Storage</h2>
                <p>
                  We use Google Firebase cloud infrastructure with strict Firestore Security Rules. We do not sell, rent, or lease customer data to third-party advertisers.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">4. Contact</h2>
                <p>
                  For privacy inquiries or account data deletion requests, contact our primary helpline desk at +91 88255 41297 or email support@watershell.in.
                </p>
              </>
            )}

            {type === 'terms' && (
              <>
                <p>
                  Welcome to Water Shell. By accessing our portfolio website or ordering via our Android application, you agree to comply with and be bound by the following terms.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">1. Authenticity of Equipment & Spares</h2>
                <p>
                  All RO water purifiers, water dispensers, booster pumps, SMPS adapters, and filter cartridges listed on Water Shell are authentic, certified products. Unauthorized reproduction of product designs or proprietary media is strictly prohibited.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">2. Pricing & Orders</h2>
                <p>
                  Prices shown on this portfolio website are public retail prices (inclusive of GST). Authorized dealers who are verified and approved by the Water Shell administrative desk receive wholesale pricing when signed into the mobile application.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">3. Mobile Application</h2>
                <p>
                  The Water Shell mobile app (com.watershell.app) provides real-time ordering, live order progress tracking, and 1-tap service booking. Users must provide valid contact numbers and delivery addresses to ensure proper logistics routing.
                </p>
              </>
            )}

            {type === 'delivery' && (
              <>
                <h2 className="font-extrabold text-brand-navy text-base">1. Direct Doorstep Machine Delivery</h2>
                <p>
                  Water Shell operates a direct fulfillment hub originating from our Tambaram Central Base Center. All RO Water Purifiers and Water Dispensers are delivered directly by our dedicated logistics team to the following 4 primary zones:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li><span className="font-semibold text-brand-navy">Zone 1: Chennai Metropolitan Area</span> (Tambaram, Chromepet, Guindy, Velachery, OMR, etc.) – Within 24 Hours.</li>
                  <li><span className="font-semibold text-brand-navy">Zone 2: Chengalpattu District</span> (Chengalpattu town, Maraimalai Nagar, Guduvanchery) – Within 24-48 Hours.</li>
                  <li><span className="font-semibold text-brand-navy">Zone 3: Kanchipuram District</span> (Kanchipuram, Walajabad, Sriperumbudur) – Within 24-48 Hours.</li>
                  <li><span className="font-semibold text-brand-navy">Zone 4: Pondicherry / Puducherry UT</span> (Puducherry, Ozhukarai, Villianur) – Scheduled Delivery within 48-72 Hours.</li>
                </ul>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">2. Complimentary Technician Installation</h2>
                <p>
                  Every domestic RO machine delivered to the 4 primary zones includes certified complimentary technician installation, including wall-mount bracket fitting, inlet water diverter hookup, and initial TDS balance verification.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">3. Spares & Accessories Fulfillment</h2>
                <p>
                  Replacement filter sets, booster pumps, and SMPS adapters are fulfilled immediately through our network of authorized local dealers in your neighborhood, preventing delivery waiting times.
                </p>
                <h2 className="font-extrabold text-brand-navy text-base pt-2">4. 1-Year Comprehensive Warranty</h2>
                <p>
                  All new domestic RO purifiers are protected by a 1-Year Comprehensive Service Warranty covering electrical components, booster pumps, and SMPS power units against manufacturing defects.
                </p>
              </>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">Water Shell Official Policy • Version 1.2</span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

