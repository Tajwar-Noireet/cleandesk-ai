const isReduced = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

export const transition = {
  type: 'tween',
  ease: [0.25, 1, 0.5, 1], // premium smooth curve
  duration: isReduced ? 0 : 0.45
};

export const fadeUp = {
  hidden: { y: isReduced ? 0 : 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition
  }
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: isReduced ? 0 : 0.08
    }
  }
};

export const scaleIn = {
  hidden: { scale: isReduced ? 1 : 0.97, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition
  }
};

export const slideInLeft = {
  hidden: { x: isReduced ? 0 : -32, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition
  }
};

export const slideInRight = {
  hidden: { x: isReduced ? 0 : 32, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition
  }
};

// Interaction states
export const hoverLift = isReduced ? {} : {
  y: -2,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const tapScale = isReduced ? {} : {
  scale: 0.98,
  transition: { duration: 0.1, ease: 'easeOut' }
};

export const smoothTransition = transition;
