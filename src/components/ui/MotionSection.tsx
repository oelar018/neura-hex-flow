import * as React from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Section } from "./Section";
import { getQualityConfig, getCurrentQuality } from '@/config/visual';

interface MotionSectionProps extends React.ComponentProps<typeof Section> {
  stagger?: number;
  delay?: number;
  disabled?: boolean;
}

const MotionSection = React.forwardRef<HTMLElement, MotionSectionProps>(
  ({ children, stagger = 0.1, delay = 0, disabled = false, ...props }, ref) => {
    const sectionRef = React.useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { 
      once: true, 
      amount: 0.2,
      margin: "-100px 0px -100px 0px"
    });
    const qualityConfig = getQualityConfig();

    // Check for reduced motion preference
    const prefersReducedMotion = React.useMemo(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const shouldAnimate = !disabled && !prefersReducedMotion;

    const containerVariants: Variants = {
      hidden: { opacity: shouldAnimate ? 0 : 1 },
      visible: {
        opacity: 1,
        transition: {
          duration: qualityConfig.animationDuration,
          delay: delay,
          staggerChildren: shouldAnimate ? stagger : 0
        }
      }
    };

    return (
      <Section 
        ref={sectionRef} 
        {...props}
        style={{
          contentVisibility: qualityConfig.contentVisibility ? 'auto' : 'visible',
          contain: qualityConfig.contentVisibility ? 'content' : 'none',
          ...props.style
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {children}
        </motion.div>
      </Section>
    );
  }
);

MotionSection.displayName = "MotionSection";

// Child component for individual animated elements
const MotionItem = React.forwardRef<
  HTMLDivElement,
  {
    children?: React.ReactNode;
    className?: string;
    y?: number;
    scale?: number;
    disabled?: boolean;
    onClick?: () => void;
  }
>(({ children, y = 20, scale = 0.95, disabled = false, className, onClick }, ref) => {
  const qualityConfig = getQualityConfig();
  
  // Check for reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const shouldAnimate = !disabled && !prefersReducedMotion;

  const itemVariants: Variants = {
    hidden: { 
      opacity: shouldAnimate ? 0 : 1,
      y: shouldAnimate ? y : 0,
      scale: shouldAnimate ? scale : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: getCurrentQuality() === 'low' ? "tween" : "spring",
        stiffness: getCurrentQuality() === 'low' ? undefined : 400,
        damping: getCurrentQuality() === 'low' ? undefined : 30,
        duration: qualityConfig.animationDuration,
        ease: getCurrentQuality() === 'low' ? "easeOut" : undefined
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

MotionItem.displayName = "MotionItem";

export { MotionSection, MotionItem };