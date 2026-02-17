import type { Variants, Transition } from "framer-motion";

// Transitions
export const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
};

export const SOFT_SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 20,
};

export const HIGH_TENSION_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// Variants
export const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const SLIDE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_TRANSITION,
  },
};

export const SCALE_POP_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: HIGH_TENSION_SPRING,
  },
};

export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};
