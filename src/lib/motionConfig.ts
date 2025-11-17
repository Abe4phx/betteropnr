// Motion Configuration Constants
export const Motion = {
  duration: {
    fast: 0.2,
    medium: 0.4,
    slow: 0.6,
  },
  ease: [0.4, 0, 0.2, 1] as const, // cubic-bezier for Tailwind ease-in-out
  stagger: {
    fast: 0.06,
    medium: 0.08,
    slow: 0.12,
  },
};

// Page Transition Variants
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: Motion.duration.medium, ease: Motion.ease },
};

// Card Animation Variants
export const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    y: -2, 
    boxShadow: '0 10px 30px -10px rgba(255, 107, 107, 0.3)',
    transition: { duration: Motion.duration.fast, ease: Motion.ease }
  },
};

// Spark Burst Animation (for Generate button)
export const sparkBurst = {
  initial: { scale: 0.9, opacity: 1 },
  animate: { scale: 1.1, opacity: 0 },
  transition: { duration: 0.8, ease: 'easeOut' },
};

// Staggered Children Container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: Motion.stagger.medium,
    },
  },
};

// Heart Pulse Animation (for favorite button)
export const heartPulse = {
  scale: [1, 1.15, 1],
  transition: { duration: 0.4, ease: Motion.ease },
};

// Modal Animation Variants
export const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: Motion.duration.medium, ease: Motion.ease },
};

// Shimmer Gradient Animation (for CTA buttons)
export const shimmerVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  },
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Toast Slide Animation
export const toastSlideUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 10, opacity: 0 },
  transition: { duration: 0.25, ease: Motion.ease },
};

// Utility: Get motion props based on prefers-reduced-motion
export const getMotionProps = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: Motion.duration.fast },
    };
  }
  return pageTransition;
};
