import { Variants, TargetAndTransition } from 'framer-motion';

// Easing presets
export const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
export const springTransition = { type: 'spring' as const, damping: 25, stiffness: 200 };
export const gentleSpring = { type: 'spring' as const, damping: 30, stiffness: 150 };

// Stagger container variants
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

// Section / Element Entrance Variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: smoothEase,
    },
  },
};

// Word / text split reveal
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '35%', rotateX: -20 },
  visible: {
    opacity: 1,
    y: '0%',
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Card Hover & Tap Interactions
export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const tapScale: TargetAndTransition = {
  scale: 0.97,
  transition: { duration: 0.1, ease: 'easeIn' },
};

export const cardHover: TargetAndTransition = {
  y: -6,
  transition: { duration: 0.25, ease: 'easeOut' },
};

// Modal Animations
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.24, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
