import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import { modalOverlayVariants, modalContentVariants, tapScale, hoverScale } from '../utils/animations';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProductId?: string;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  targetProductId,
}) => {
  const [tab, setTab] = useState<'apk' | 'stores' | 'qrcode'>('apk');
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) return null;

  const appSchemeUrl = targetProductId
    ? `watershell://product/${targetProductId}`
    : 'watershell://';

  const handleLaunchDeepLink = () => {
    // Attempt deep link
    window.location.href = appSchemeUrl;
  };

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
        className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-brand-border overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-brand-navy text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl p-1 shadow-md flex items-center justify-center">
              <img
                src="/images/app-icon.png"
                alt="Water Shell App Icon"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Water Shell Mobile App</h3>
              <p className="text-xs text-white/70">Android & iOS • Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Deep link prompt if coming from a specific product */}
        {targetProductId && (
          <div className="px-6 py-3 bg-brand-orange-muted border-b border-brand-orange/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-navy">
              Already have the Water Shell app installed?
            </span>
            <button
              onClick={handleLaunchDeepLink}
              className="text-xs font-bold text-brand-navy bg-brand-orange hover:bg-brand-orange-light px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Open in App</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setTab('apk')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'apk'
                ? 'border-brand-navy text-brand-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct APK Download
          </button>
          <button
            onClick={() => setTab('stores')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'stores'
                ? 'border-brand-navy text-brand-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            App Stores
          </button>
          <button
            onClick={() => setTab('qrcode')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'qrcode'
                ? 'border-brand-navy text-brand-navy bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Scan QR Code
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {tab === 'apk' && (
            <div className="space-y-4 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-brand-green">
                <Download className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-navy">Download AquaPure.apk</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Official Android application package (com.watershell.app). Includes full customer shopping, dealer portal & service booking.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">File:</span>
                  <span className="font-bold text-brand-navy">AquaPure.apk</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Target OS:</span>
                  <span className="font-semibold text-slate-700">Android 8.0+</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Package:</span>
                  <span className="font-mono text-[11px] text-slate-700">com.watershell.app</span>
                </div>
              </div>

              <motion.a
                href="/AquaPure.apk"
                download="AquaPure.apk"
                whileHover={shouldReduceMotion ? undefined : hoverScale}
                whileTap={shouldReduceMotion ? undefined : tapScale}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-brand-navy-dark bg-brand-orange hover:bg-brand-orange-light shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download APK (39 MB)</span>
              </motion.a>

              <p className="text-[11px] text-slate-400">
                Safe & verified package directly from Water Shell build pipeline.
              </p>
            </div>
          )}

          {tab === 'stores' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-base font-bold text-brand-navy">Download from Official App Stores</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Water Shell is accessible across all mobile devices.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Google Play */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-brand-navy">Google Play Store</h5>
                      <span className="text-[11px] text-brand-green font-semibold">Ready for Android</span>
                    </div>
                  </div>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.watershell.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-bold text-brand-navy bg-white border border-slate-200 rounded-lg hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    View Store
                  </a>
                </div>

                {/* Apple App Store */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <span className="text-lg">🍎</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-brand-navy">Apple App Store</h5>
                      <span className="text-[11px] text-slate-500 font-medium">Coming Soon (iOS)</span>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-200 rounded-lg">
                    In Review
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'qrcode' && (
            <div className="text-center space-y-4">
              <h4 className="text-base font-bold text-brand-navy">Scan to Download on Mobile</h4>
              <p className="text-xs text-slate-500">
                Point your phone camera at this QR code to download the application directly to your handset.
              </p>

              {/* QR Code Graphic */}
              <div className="inline-block p-4 bg-white border-2 border-brand-navy rounded-2xl shadow-md">
                <svg
                  className="w-44 h-44 mx-auto text-brand-navy"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
                  <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
                  <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                  <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
                  <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                  <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                  {/* Decorative QR code blocks */}
                  <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="48" y="14" width="12" height="6" fill="currentColor" />
                  <rect x="36" y="24" width="6" height="12" fill="currentColor" />
                  <rect x="48" y="32" width="16" height="8" fill="currentColor" />
                  <rect x="12" y="44" width="14" height="6" fill="currentColor" />
                  <rect x="32" y="44" width="8" height="18" fill="currentColor" />
                  <rect x="48" y="48" width="10" height="10" fill="currentColor" />
                  <rect x="68" y="42" width="18" height="8" fill="currentColor" />
                  <rect x="74" y="60" width="12" height="12" fill="currentColor" />
                  <rect x="40" y="72" width="14" height="6" fill="currentColor" />
                  <rect x="58" y="78" width="10" height="12" fill="currentColor" />
                  <rect x="40" y="86" width="14" height="6" fill="currentColor" />
                </svg>
                <span className="block text-[11px] font-bold text-brand-navy mt-2 uppercase tracking-wider">
                  Water Shell Android APK
                </span>
              </div>
            </div>
          )}

          {/* Guaranteed Security Note */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>Verified safe download • Direct from Water Shell</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
