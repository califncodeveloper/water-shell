import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Phone } from 'lucide-react';
import { FAQS } from '../data/faqs';
import { FAQItem } from '../types';
import { fadeInUp, staggerContainer, tapScale, hoverScale } from '../utils/animations';

interface FAQSectionProps {
  onOpenAppModal: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenAppModal }) => {
  const [activeFaq, setActiveFaq] = useState<string | null>('faq-1');
  const [filter, setFilter] = useState<'all' | 'general' | 'products' | 'app' | 'delivery' | 'service'>('all');
  const shouldReduceMotion = useReducedMotion();

  const filteredFaqs = FAQS.filter(
    (item) => filter === 'all' || item.category === filter
  );

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section id="faqs" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy text-xs font-bold uppercase tracking-wider">
            Help Center & Clarity
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Have questions about Water Shell purifiers, our mobile application, doorstep delivery, or authorized dealer network? Find your answers here.
          </p>
        </motion.div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {(
            [
              { id: 'all', label: 'All FAQs' },
              { id: 'general', label: 'General' },
              { id: 'products', label: 'Products' },
              { id: 'app', label: 'Mobile App' },
              { id: 'delivery', label: 'Delivery & Zones' },
              { id: 'service', label: 'Service & Booking' },
            ] as const
          ).map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* FAQ Accordion List with AnimatePresence */}
        <motion.div
          variants={staggerContainer(0.06, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {filteredFaqs.map((faq: FAQItem) => {
            const isOpen = activeFaq === faq.id;
            return (
              <motion.div
                key={faq.id}
                variants={fadeInUp}
                className={`rounded-2xl border transition-colors overflow-hidden ${
                  isOpen
                    ? 'border-brand-navy/30 bg-slate-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-brand-navy">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isOpen
                        ? 'bg-brand-navy text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Still have questions card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 p-6 sm:p-8 rounded-3xl bg-brand-orange-muted/50 border border-brand-orange/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange text-brand-navy-dark flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-brand-navy">
                Still have unanswered questions?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Speak directly with customer care at <span className="font-bold text-brand-navy">+91 88255 41297</span> (Desk 1) or <span className="font-bold text-brand-navy">+91 86108 76009</span> (Desk 2).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.a
              href="tel:+918825541297"
              whileHover={shouldReduceMotion ? undefined : hoverScale}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-xs transition-colors"
            >
              Call Helpline
            </motion.a>
            <motion.button
              onClick={onOpenAppModal}
              whileHover={shouldReduceMotion ? undefined : hoverScale}
              whileTap={shouldReduceMotion ? undefined : tapScale}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-navy bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
            >
              Get Mobile App
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
