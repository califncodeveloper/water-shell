import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Smartphone, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface NavbarProps {
  onOpenAppModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAppModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Products', href: '#products', path: '/products' },
    { name: 'Categories', href: '#categories', path: '/categories' },
    { name: 'Technology', href: '#technology', path: '/technology' },
    { name: 'Why Us', href: '#why-us', path: '/why-us' },
    { name: 'Mobile App', href: '#app', path: '/app' },
    { name: 'How It Works', href: '#how-it-works', path: '/how-it-works' },
    { name: 'Support', href: '#support', path: '/support' },
    { name: 'FAQs', href: '#faqs', path: '/faqs' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: { href: string; path: string }) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollTo(link.href, { offset: -80, duration: 1.15 });
    } else {
      navigate(link.path);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollTo(0, { duration: 1.0 });
    } else {
      navigate('/');
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(27,31,94,0.08)] py-2'
          : 'bg-white/80 backdrop-blur-md border-b border-slate-100/80 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity with Official Water Shell Logo */}
          <motion.a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group shrink-0 focus:outline-none cursor-pointer"
            aria-label="Water Shell Home"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-100 group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/watershell-logo.png"
                alt="Water Shell"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-brand-navy leading-none font-sans">
                Water Shell
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-green mt-0.5">
                Pure Water • Smarter Living
              </span>
            </div>
          </motion.a>

          {/* Desktop Navigation with Animated Pill Hover */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 relative">
            {navLinks.map((link) => {
              const isHovered = hoveredLink === link.name;
              const isActive = location.pathname === link.path;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-brand-navy font-bold' : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="navbar-hover-pill"
                      className="absolute inset-0 bg-slate-100/80 rounded-full -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                  {isActive && !isHovered && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-orange rounded-full" />
                  )}
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Right Actions: Helpline Pill + CTA Button */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <motion.a
              href="tel:+918825541297"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-brand-navy bg-slate-100/70 hover:bg-slate-100 rounded-full transition-colors whitespace-nowrap border border-slate-200/60 shadow-xs"
              title="Call primary support desk"
            >
              <Phone className="w-3.5 h-3.5 text-brand-navy shrink-0" />
              <span className="font-semibold tracking-tight">+91 88255 41297</span>
            </motion.a>

            <motion.button
              onClick={onOpenAppModal}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 14px rgba(245, 166, 35, 0.4)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light rounded-full shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-navy-dark" />
              <span>Get App</span>
            </motion.button>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <motion.button
              onClick={onOpenAppModal}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-navy-dark bg-brand-orange rounded-full shadow-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App</span>
            </motion.button>

            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-white/98 backdrop-blur-xl border-b border-slate-200/90 shadow-xl"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04, delayChildren: 0.05 },
                },
              }}
              className="px-4 pt-3 pb-6 space-y-1.5"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(e, link);
                  }}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.a>
              ))}

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="tel:+918825541297"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-brand-navy bg-slate-100 rounded-xl"
                >
                  <Phone className="w-4 h-4 text-brand-navy" />
                  <span>Call Support: +91 88255 41297</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAppModal();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light rounded-xl shadow-xs cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-brand-navy-dark" />
                  <span>Download Water Shell App</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
