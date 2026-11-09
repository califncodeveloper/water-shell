import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Droplet,
  Smartphone,
  ShoppingBag,
  Headphones,
  Store,
  Wrench,
  Check,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../utils/animations';

export const WhyChooseSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const benefits = [
    {
      icon: <Droplet className="w-6 h-6 text-brand-navy" />,
      bg: 'bg-brand-navy-muted',
      title: 'Complete Multi-Barrier Filtration',
      description:
        'Engineered with high-rejection RO membranes, UV-C sterilizers, hollow-fiber UF, and mineralizer cartridges capable of handling up to 2500 ppm input TDS.',
      badge: 'Certified Purity',
      highlight: 'RO + UV + UF + Alkaline',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-brand-orange" />,
      bg: 'bg-brand-orange-muted',
      title: 'Intuitive Mobile Experience',
      description:
        'Explore the full 50+ item catalog, compare technical specifications, check delivery eligibility, and track live order progress with one tap.',
      badge: 'Smart Living',
      highlight: 'Live Telemetry & Sync',
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-brand-green" />,
      bg: 'bg-emerald-50',
      title: 'Direct Doorstep Machine Delivery',
      description:
        'Purifiers and dispensers dispatch directly from our Tambaram Base Hub to homes and offices across Chennai, Chengalpattu, Kanchipuram, and Pondicherry.',
      badge: 'Tambaram Origin',
      highlight: '4 Major Base Zones',
    },
    {
      icon: <Store className="w-6 h-6 text-brand-navy" />,
      bg: 'bg-brand-navy-muted',
      title: 'Authorized Local Dealer Network',
      description:
        'Neighborhood dealers ensure authentic replacement filters, membranes, booster pumps, and fittings are always available without waiting for courier delays.',
      badge: 'Local Presence',
      highlight: '100% Genuine Spares',
    },
    {
      icon: <Wrench className="w-6 h-6 text-brand-orange" />,
      bg: 'bg-brand-orange-muted',
      title: 'One-Tap Service Booking',
      description:
        'Schedule certified technician visits, annual filter maintenance, and membrane descaling in 60 seconds directly inside the Water Shell app.',
      badge: 'Quick Care',
      highlight: 'Trained Technicians',
    },
    {
      icon: <Headphones className="w-6 h-6 text-brand-green" />,
      bg: 'bg-emerald-50',
      title: 'Direct Helpline & Branch Network',
      description:
        'Connect directly with our dedicated customer support desks or regional hubs in Tambaram, Mudichur, and Guduvanchery for immediate assistance.',
      badge: 'Human Support',
      highlight: '+91 88255 41297',
    },
  ];

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-brand-gray relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-muted text-brand-green text-xs font-bold uppercase tracking-wider">
            Brand Strengths
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            Why Choose Water Shell?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            We combined high-performance water filtration with modern digital ordering, genuine factory spares, and an active local service network to create a dependable clean water experience.
          </p>
        </motion.div>

        {/* Benefits Grid (6 Cards) with Staggered Entrance */}
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      y: -6,
                      boxShadow: '0 20px 35px -8px rgba(27, 31, 94, 0.14), 0 8px 16px -4px rgba(27, 31, 94, 0.06)',
                    }
              }
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}
                  >
                    {b.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {b.badge}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-brand-navy mb-2.5 group-hover:text-brand-navy-light transition-colors">
                  {b.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-brand-green">
                  <Check className="w-4 h-4" />
                  <span>Verified Standard</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {b.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
