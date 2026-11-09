import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, MapPin, Download } from 'lucide-react';
import { LegalModalType } from './LegalModals';
import { fadeInUp, staggerContainer, tapScale, hoverScale } from '../utils/animations';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface FooterProps {
  onOpenAppModal: () => void;
  onOpenLegalModal: (type: LegalModalType) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAppModal,
  onOpenLegalModal,
  onSelectCategory,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollTo } = useSmoothScroll();

  const categories = [
    { id: 'ro-water-purifiers', name: 'RO Water Purifiers' },
    { id: 'water-dispensers', name: 'Water Dispensers' },
    { id: 'booster-pumps', name: 'Booster Pumps' },
    { id: 'smps-power-units', name: 'SMPS Power Units' },
    { id: 'water-treatment-accessories-filters', name: 'Water Treatment Accessories & Filters' },
  ];

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    if (location.pathname === '/') {
      scrollTo('#products', { offset: -80 });
    } else {
      navigate('/products');
    }
  };

  const handleQuickNav = (e: React.MouseEvent, target: string, path: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollTo(target, { offset: -80 });
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-brand-navy-dark text-white border-t border-brand-navy-surface pt-16 pb-12 relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-navy-light/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10"
        >
          {/* Column 1: Brand & Identity (2 cols) */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-white/20">
                <img
                  src="/images/watershell-logo.png"
                  alt="Water Shell Logo"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white font-sans block">
                  Water Shell
                </span>
                <span className="block text-[10px] uppercase font-bold text-brand-orange tracking-widest">
                  Pure Water • Smarter Living
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Laboratory-certified domestic and commercial RO water purifiers, water dispensers, booster pumps, and SMPS power units engineered for Chennai, Chengalpattu, Kanchipuram, and Pondicherry.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <motion.button
                onClick={onOpenAppModal}
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Water Shell App</span>
              </motion.button>

              <motion.a
                href="tel:+918825541297"
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange" />
                <span>Call Helpline</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Column 2: Product Categories */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xs font-bold tracking-wider uppercase text-brand-orange mb-4">
              Catalog Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="hover:text-brand-orange transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Quick Navigation */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xs font-bold tracking-wider uppercase text-brand-orange mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleQuickNav(e, '#about', '/technology')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  About Brand & Mission
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  onClick={(e) => handleQuickNav(e, '#technology', '/technology')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Filtration Technology
                </a>
              </li>
              <li>
                <a
                  href="#why-us"
                  onClick={(e) => handleQuickNav(e, '#why-us', '/why-us')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Why Water Shell
                </a>
              </li>
              <li>
                <a
                  href="#app"
                  onClick={(e) => handleQuickNav(e, '#app', '/app')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Mobile App Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleQuickNav(e, '#how-it-works', '/how-it-works')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#support"
                  onClick={(e) => handleQuickNav(e, '#support', '/support')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Branch Locations & Hubs
                </a>
              </li>
              <li>
                <a
                  href="#faqs"
                  onClick={(e) => handleQuickNav(e, '#faqs', '/faqs')}
                  className="hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Contact & Operations */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-xs font-bold tracking-wider uppercase text-brand-orange mb-4">
              Customer Desks & Hubs
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Desk 1: +91 88255 41297</span>
                  <span className="text-[11px] text-slate-400">Sales & Orders</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Desk 2: +91 86108 76009</span>
                  <span className="text-[11px] text-slate-400">Service Escalations</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Tambaram Base Hub</span>
                  <span className="text-[11px] text-slate-400">Ph: 9789009889</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 Water Shell. All rights reserved.</span>
            <span>•</span>
            <span className="text-brand-green font-medium">Certified Purity Guarantee</span>
          </div>

          {/* Legal Document Links */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <button
              onClick={() => onOpenLegalModal('privacy')}
              className="text-[10px] text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
            >
              (Modal)
            </button>
            <span>•</span>
            <Link
              to="/terms"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Terms & Conditions
            </Link>
            <button
              onClick={() => onOpenLegalModal('terms')}
              className="text-[10px] text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
            >
              (Modal)
            </button>
            <span>•</span>
            <Link
              to="/warranty"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Delivery & Warranty Policy
            </Link>
            <button
              onClick={() => onOpenLegalModal('delivery')}
              className="text-[10px] text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
            >
              (Modal)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
