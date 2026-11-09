import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Shield,
  Wrench,
  Search,
  ShoppingBag,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { fadeInUp, staggerContainer, tapScale } from '../utils/animations';

interface AppShowcaseSectionProps {
  onOpenAppModal: () => void;
}

type ScreenType = 'home' | 'catalog' | 'cart' | 'service' | 'helpline';

export const AppShowcaseSection: React.FC<AppShowcaseSectionProps> = ({ onOpenAppModal }) => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const shouldReduceMotion = useReducedMotion();

  const appFeatures = [
    {
      id: 'catalog' as ScreenType,
      title: 'Browse 50+ Product Models',
      description: 'Explore domestic RO purifiers, commercial dispensers, booster pumps, and replacement filters with verified specifications.',
      icon: <Search className="w-5 h-5 text-brand-navy" />,
    },
    {
      id: 'cart' as ScreenType,
      title: 'Smart Cart & Zone Delivery Checks',
      description: 'Automatic doorstep machine eligibility check for Chennai, Chengalpattu, Kanchipuram, and Pondicherry.',
      icon: <ShoppingBag className="w-5 h-5 text-brand-green" />,
    },
    {
      id: 'home' as ScreenType,
      title: 'Live Telemetry & Dealer Portal',
      description: 'View real-time purity scores, filter health indicators, and access exclusive wholesale pricing for verified dealers.',
      icon: <Shield className="w-5 h-5 text-brand-orange" />,
    },
    {
      id: 'service' as ScreenType,
      title: 'One-Tap Service & Maintenance Booking',
      description: 'Schedule certified technician visits for filter replacements, membrane servicing, and repairs in 60 seconds.',
      icon: <Wrench className="w-5 h-5 text-brand-navy" />,
    },
    {
      id: 'helpline' as ScreenType,
      title: 'Direct Helpline & Branch Directory',
      description: 'Single-tap phone and WhatsApp connectivity to Support Desks and physical hubs in Tambaram, Mudichur, and Guduvanchery.',
      icon: <PhoneCall className="w-5 h-5 text-brand-green" />,
    },
  ];

  return (
    <section id="app" className="py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-brand-gray relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-brand-orange-muted/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-brand-navy-muted/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange text-brand-navy-dark text-xs font-black uppercase tracking-wider shadow-sm">
            <Smartphone className="w-4 h-4" />
            Official Mobile Experience
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
            The Water Shell Mobile App
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Water purification at your fingertips. Discover products, check delivery eligibility, order doorstep installations, book certified service technicians, and manage your dealer wholesale account.
          </p>
        </motion.div>

        {/* Showcase Grid: Features on Left, Interactive Phone Mockup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Features Column (7 cols) */}
          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-green">
                Zero Friction Mobile Solution
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-navy leading-tight">
                Engineered for Customers & Authorized Dealers Alike
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether you need a new multi-stage RO purifier for your home, emergency maintenance on an existing unit, or bulk commercial spares for your retail shop, the Water Shell app handles it effortlessly.
              </p>
            </div>

            {/* Feature Cards List with Interactive Preview triggers */}
            <div className="space-y-3 pt-2">
              {appFeatures.map((feat) => {
                const isCurrentScreen = activeScreen === feat.id;
                return (
                  <motion.div
                    key={feat.title}
                    variants={fadeInUp}
                    onClick={() => setActiveScreen(feat.id)}
                    whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isCurrentScreen
                        ? 'bg-white border-brand-navy shadow-md ring-2 ring-brand-navy/10'
                        : 'bg-white/80 border-slate-200/90 shadow-xs hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                      {feat.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-brand-navy">{feat.title}</h4>
                        {isCurrentScreen && (
                          <span className="text-[10px] font-bold text-brand-orange bg-brand-orange-muted px-2 py-0.5 rounded-md">
                            Active Preview
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{feat.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Main Action CTAs */}
            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <motion.a
                  href="/AquaPure.apk"
                  download="AquaPure.apk"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.04, boxShadow: '0 6px 20px rgba(245, 166, 35, 0.4)' }}
                  whileTap={shouldReduceMotion ? undefined : tapScale}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (39 MB)</span>
                </motion.a>

                <motion.button
                  onClick={onOpenAppModal}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                  whileTap={shouldReduceMotion ? undefined : tapScale}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4 text-brand-navy" />
                  <span>Scan QR Code or Store Links</span>
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                  <span>Package: com.watershell.app</span>
                </div>
                <span>•</span>
                <span>Requires Android 8.0+</span>
                <span>•</span>
                <span className="text-brand-green font-semibold">100% Virus & Malware Free</span>
              </div>
            </div>
          </motion.div>

          {/* Phone Device Mockup Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Screen Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-xs mb-4 overflow-x-auto max-w-full">
              {(
                [
                  { id: 'home', label: 'Home' },
                  { id: 'catalog', label: 'Catalog' },
                  { id: 'cart', label: 'Cart' },
                  { id: 'service', label: 'Service' },
                  { id: 'helpline', label: 'Helpline' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScreen(tab.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeScreen === tab.id
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Smartphone Outer Shell with gentle float animation */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, -8, 0],
                    }
              }
              transition={{
                duration: 5.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className="relative w-[290px] sm:w-[320px] h-[590px] sm:h-[630px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-950/20"
            >
              {/* Speaker & Dynamic Island Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center gap-2">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-800" />
              </div>

              {/* Screen Inner Display */}
              <div className="w-full h-full bg-brand-gray rounded-[38px] overflow-hidden flex flex-col relative border border-slate-800 text-slate-800 text-left font-sans select-none">
                {/* Mobile Status Bar */}
                <div className="h-7 bg-brand-navy text-white text-[10px] flex items-center justify-between px-6 pt-1 font-semibold">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Mobile Header */}
                <div className="bg-brand-navy text-white px-4 py-2.5 flex items-center justify-between border-b border-brand-navy-light/40">
                  <div className="flex items-center gap-2">
                    <img src="/images/watershell-logo.png" alt="" className="w-5 h-5 object-contain" />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Water Shell</span>
                      <span className="text-[9px] text-brand-orange font-medium">Tambaram Base Hub</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                    🔔
                  </div>
                </div>

                {/* Dynamic Screen Content with AnimatePresence */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 text-xs">
                  <AnimatePresence mode="wait">
                    {activeScreen === 'home' && (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-3"
                      >
                        {/* Hero banner inside app */}
                        <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white p-3.5 rounded-2xl space-y-1.5 shadow-xs">
                          <span className="text-[9px] font-bold text-brand-orange uppercase">Official App</span>
                          <h5 className="font-extrabold text-xs">Pure Water. Smarter Living.</h5>
                          <p className="text-[10px] text-slate-200">Doorstep delivery to 4 major zones</p>
                          <div className="pt-1">
                            <span className="text-[9px] bg-white text-brand-navy font-bold px-2 py-0.5 rounded-md inline-block">
                              Shop 50+ Models
                            </span>
                          </div>
                        </div>

                        {/* Live Telemetry Widget */}
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-brand-orange uppercase flex items-center gap-1">
                              <Zap className="w-3 h-3 text-brand-orange" />
                              Live Purity Telemetry
                            </span>
                            <span className="text-[9px] text-emerald-600 font-bold">Online</span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className="text-[9px] text-slate-400 block">Purity Index</span>
                              <span className="text-lg font-black text-brand-navy font-sans">98.8%</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 block">Filtered TDS</span>
                              <span className="text-base font-bold text-emerald-600">28 ppm</span>
                            </div>
                          </div>
                        </div>

                        {/* Categories Shortcut */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Categories
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-sm">💧</span>
                              <span className="text-[9px] font-bold block text-brand-navy mt-1 truncate">RO Purifiers</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-sm">🚰</span>
                              <span className="text-[9px] font-bold block text-brand-navy mt-1 truncate">Dispensers</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-sm">⚙️</span>
                              <span className="text-[9px] font-bold block text-brand-navy mt-1 truncate">Pumps & Spares</span>
                            </div>
                          </div>
                        </div>

                        {/* Featured Model */}
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                          <img src="/images/aqua-touch.jpg" alt="" className="w-12 h-12 object-contain" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-brand-orange block">FLAGSHIP</span>
                            <span className="text-[11px] font-extrabold text-brand-navy truncate block">Aqua Touch</span>
                            <span className="text-[10px] font-black text-brand-navy">₹15,999</span>
                          </div>
                          <span className="text-[9px] bg-brand-navy text-white px-2 py-1 rounded-lg font-bold">
                            View
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeScreen === 'catalog' && (
                      <motion.div
                        key="catalog"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-2"
                      >
                        <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] text-slate-400">Search RO, Dispenser, Spares...</span>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-brand-navy block">Aqua Touch Smart RO</span>
                              <span className="text-[9px] text-slate-500">10-Stage Touch Controls</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-navy">₹15,999</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-brand-navy block">AquaPure Grand RO</span>
                              <span className="text-[9px] text-slate-500">10-Stage Alkaline + Copper</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-navy">₹14,999</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-brand-navy block">AquaPure Slim Copper</span>
                              <span className="text-[9px] text-slate-500">Wall Mount 7L RO+UV</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-navy">₹12,499</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-brand-navy block">Floor Water Dispenser</span>
                              <span className="text-[9px] text-slate-500">Hot & Chilled Dispenser</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-navy">₹9,999</span>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-brand-navy block">Booster Pump 1 HP</span>
                              <span className="text-[9px] text-slate-500">Heavy Duty RO Pump</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-navy">₹3,999</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeScreen === 'cart' && (
                      <motion.div
                        key="cart"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-2.5"
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Your Order (1 Item)
                        </span>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                          <img src="/images/aqua-touch.jpg" alt="" className="w-10 h-10 object-contain" />
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-brand-navy block truncate">Aqua Touch RO</span>
                            <span className="text-[9px] text-slate-500">Qty: 1 • Direct Delivery</span>
                          </div>
                          <span className="text-[10px] font-bold text-brand-navy">₹15,999</span>
                        </div>

                        {/* Delivery Zone Badge */}
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800">
                          <span className="font-bold block">✓ Doorstep Delivery Confirmed</span>
                          <span>Dispatched directly from Tambaram Base Hub</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-bold">₹15,999</span>
                          </div>
                          <div className="flex justify-between text-brand-green font-semibold">
                            <span>Technician Installation</span>
                            <span>FREE</span>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-brand-orange text-brand-navy-dark font-extrabold text-[10px] rounded-xl shadow-xs">
                          Proceed to Checkout
                        </button>
                      </motion.div>
                    )}

                    {activeScreen === 'service' && (
                      <motion.div
                        key="service"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-2"
                      >
                        <div className="p-2.5 rounded-xl bg-brand-navy text-white space-y-1">
                          <span className="text-[9px] font-bold text-brand-orange uppercase">Quick Booking</span>
                          <h6 className="font-bold text-[11px]">Schedule Technician Visit</h6>
                          <p className="text-[9px] text-slate-300">Certified maintenance & filter change</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="p-2 bg-white rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-brand-navy block">1. Annual Maintenance (AMC)</span>
                            <span className="text-[9px] text-slate-500">Comprehensive inspection & TDS test</span>
                          </div>

                          <div className="p-2 bg-white rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-brand-navy block">2. Filter Cartridge Replacement</span>
                            <span className="text-[9px] text-slate-500">Sediment + Carbon + Post Carbon</span>
                          </div>

                          <div className="p-2 bg-white rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-brand-navy block">3. RO Membrane Descaling</span>
                            <span className="text-[9px] text-slate-500">Restore flow rate and purity balance</span>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-brand-green text-white font-extrabold text-[10px] rounded-xl shadow-xs">
                          Confirm Appointment
                        </button>
                      </motion.div>
                    )}

                    {activeScreen === 'helpline' && (
                      <motion.div
                        key="helpline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-2"
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Authorized Helpline
                        </span>

                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[9px] text-blue-600 font-bold block">SUPPORT DESK 1</span>
                          <span className="text-[11px] font-extrabold text-brand-navy">+91 88255 41297</span>
                          <span className="text-[9px] text-slate-500 block">Orders & General Inquiries</span>
                        </div>

                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[9px] text-emerald-600 font-bold block">SUPPORT DESK 2</span>
                          <span className="text-[11px] font-extrabold text-brand-navy">+91 86108 76009</span>
                          <span className="text-[9px] text-slate-500 block">Technician Visits & Service</span>
                        </div>

                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[9px] text-amber-600 font-bold block">TAMBARAM MAIN HUB</span>
                          <span className="text-[11px] font-extrabold text-brand-navy">9789009889</span>
                          <span className="text-[9px] text-slate-500 block">Showroom & Parts Depot</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="h-12 bg-white border-t border-slate-200 px-3 flex items-center justify-around text-[10px] text-slate-400">
                  <span className={activeScreen === 'home' ? 'text-brand-navy font-bold' : ''}>Home</span>
                  <span className={activeScreen === 'catalog' ? 'text-brand-navy font-bold' : ''}>Catalog</span>
                  <span className={activeScreen === 'cart' ? 'text-brand-navy font-bold' : ''}>Cart</span>
                  <span className={activeScreen === 'service' ? 'text-brand-navy font-bold' : ''}>Service</span>
                  <span className={activeScreen === 'helpline' ? 'text-brand-navy font-bold' : ''}>Helpline</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
