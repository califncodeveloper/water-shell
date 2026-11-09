import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, CheckCircle2, Send, Building2 } from 'lucide-react';
import { SUPPORT_DESKS, BRANCH_CONTACTS, DELIVERY_ZONES } from '../data/support';
import { fadeInUp, staggerContainer, tapScale, hoverScale } from '../utils/animations';

export const CustomerSupportSection: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryPhone.trim()) return;
    setSubmitted(true);
    // WhatsApp fallback prefill
    const waUrl = `https://wa.me/918825541297?text=Hi%20Water%20Shell,%20my%20name%20is%20${encodeURIComponent(
      inquiryName || 'Customer'
    )}.%20Phone:%20${encodeURIComponent(
      inquiryPhone
    )}.%20Message:%20${encodeURIComponent(inquiryMessage || 'Please contact me regarding water purifiers.')}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="support" className="py-20 lg:py-28 bg-brand-gray relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy text-xs font-bold uppercase tracking-wider">
            Verified Contacts
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            Customer Support & Branch Hubs
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Reach our dedicated customer desks or connect directly with our operational hubs across Tambaram, Mudichur, and Guduvanchery.
          </p>
        </motion.div>

        {/* 2 Dedicated Customer Support Desks */}
        <motion.div
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {SUPPORT_DESKS.map((desk) => (
            <motion.div
              key={desk.id}
              variants={fadeInUp}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-navy-muted text-brand-navy border border-brand-navy/10">
                    {desk.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-brand-green font-semibold">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    <span>Active Helpline</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-brand-navy mb-1">
                  {desk.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  {desk.role}
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="text-2xl font-black text-brand-navy font-sans tracking-tight">
                    {desk.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{desk.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.a
                  href={`tel:${desk.dialPhone}`}
                  whileHover={shouldReduceMotion ? undefined : hoverScale}
                  whileTap={shouldReduceMotion ? undefined : tapScale}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </motion.a>
                <motion.a
                  href={`https://wa.me/${desk.whatsapp}?text=Hi%20Water%20Shell%20Support,%20I%20need%20assistance.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={shouldReduceMotion ? undefined : hoverScale}
                  whileTap={shouldReduceMotion ? undefined : tapScale}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 Physical Branch Locations */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-extrabold text-brand-navy">
              Physical Showroom & Regional Service Hubs
            </h3>
          </div>

          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {BRANCH_CONTACTS.map((branch) => (
              <motion.div
                key={branch.id}
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className={`bg-white rounded-3xl p-6 border transition-colors ${
                  branch.isMainHub
                    ? 'border-brand-orange shadow-card-hover ring-1 ring-brand-orange/20'
                    : 'border-slate-200/90 shadow-card hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      branch.isMainHub
                        ? 'bg-brand-orange text-brand-navy-dark'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {branch.badge}
                  </span>
                  {branch.isMainHub && (
                    <span className="text-[10px] uppercase font-extrabold text-brand-orange tracking-wider">
                      Origin Base
                    </span>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-brand-navy">
                  {branch.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {branch.role}
                </p>

                <div className="my-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Contact:</span>
                    <a
                      href={`tel:${branch.dialPhone}`}
                      className="font-bold text-brand-navy hover:underline"
                    >
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.hours}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <motion.a
                    href={`tel:${branch.dialPhone}`}
                    whileHover={shouldReduceMotion ? undefined : hoverScale}
                    whileTap={shouldReduceMotion ? undefined : tapScale}
                    className="flex-1 py-2 px-3 text-center text-xs font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Call Branch
                  </motion.a>
                  <motion.a
                    href={`https://wa.me/${branch.whatsapp}?text=Hi%20Water%20Shell%20${encodeURIComponent(
                      branch.title
                    )},%20I%20would%20like%20to%20visit%20or%20inquire%20about%20purifiers.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={shouldReduceMotion ? undefined : hoverScale}
                    whileTap={shouldReduceMotion ? undefined : tapScale}
                    className="p-2 text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                    title="WhatsApp Branch"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Delivery Coverage Map & Quick Callback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Delivery Coverage Zones (7 cols) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-brand-navy" />
              <h3 className="text-lg font-extrabold text-brand-navy">
                Direct Machine Delivery Zones
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Dispatched directly from our Tambaram Central Base Hub. Free delivery and certified technician installation included for all RO Water Purifiers and Water Dispensers in the following zones:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DELIVERY_ZONES.map((zone, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-navy-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-navy">0{idx + 1}</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand-navy">{zone.name}</h5>
                    <span className="text-[11px] font-semibold text-brand-green block mt-0.5">
                      {zone.deliveryTime}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {zone.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Accessories, filters & booster pumps are serviced via verified local dealers.</span>
            </div>
          </motion.div>

          {/* Quick Inquiry / WhatsApp Request (5 cols) */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="lg:col-span-5 bg-gradient-to-tr from-brand-navy to-brand-navy-light text-white rounded-3xl p-6 sm:p-8 shadow-xl"
          >
            <h3 className="text-lg font-extrabold text-white mb-1">
              Request Instant Callback
            </h3>
            <p className="text-xs text-slate-200 mb-6 leading-relaxed">
              Leave your contact details and our team will connect with you on phone or WhatsApp.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="submitted"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center space-y-3"
                >
                  <CheckCircle2 className="w-10 h-10 text-brand-green mx-auto" />
                  <h4 className="text-sm font-bold text-white">Inquiry Forwarded</h4>
                  <p className="text-xs text-slate-200">
                    Opening WhatsApp to connect you directly with Customer Support Desk 1 (+91 88255 41297).
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs text-brand-orange underline font-semibold"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                      Message or Product of Interest
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Inquiring about Aqua Touch or filter replacement"
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? undefined : tapScale}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry to Support Desk</span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
