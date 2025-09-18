import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { getQualityConfig, getCurrentQuality } from '@/config/visual';

export const GlobalBackground: React.FC = () => {
  const scrollProgress = useScrollProgress();
  const [isVisible, setIsVisible] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const qualityConfig = getQualityConfig();
  const quality = getCurrentQuality();

  // Add scroll throttling optimizations
  React.useEffect(() => {
    let rafId: number;
    const throttledUpdate = () => {
      // Batch DOM updates
      const root = document.documentElement;
      root.style.setProperty('--bg-intensity', scrollProgress.toString());
      root.style.setProperty('--glass-alpha', (0.6 + scrollProgress * 0.4).toString());
    };
    
    rafId = requestAnimationFrame(throttledUpdate);
    return () => cancelAnimationFrame(rafId);
  }, [scrollProgress]);

  // Intersection observer to pause when off-screen
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    
    const element = document.body;
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pause on tab hidden
  React.useEffect(() => {
    const handleVisibility = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility, { passive: true });
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Skip rendering if not visible and paused
  if (!isVisible && isPaused) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Aurora background that intensifies with scroll */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, hsl(var(--brand-aurora-1) / ${0.02 + scrollProgress * 0.03}) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(var(--brand-aurora-2) / ${0.01 + scrollProgress * 0.02}) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, hsl(var(--brand-aurora-3) / ${0.015 + scrollProgress * 0.025}) 0%, transparent 50%),
            linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background-subtle)) 100%)
          `,
        }}
        animate={{
          opacity: 0.3 + scrollProgress * 0.7,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Subtle animated mesh gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              hsl(var(--brand-aurora-1) / ${0.1 * qualityConfig.glowIntensity}) 0deg,
              hsl(var(--brand-aurora-2) / ${0.05 * qualityConfig.glowIntensity}) 120deg,
              hsl(var(--brand-aurora-3) / ${0.08 * qualityConfig.glowIntensity}) 240deg,
              hsl(var(--brand-aurora-1) / ${0.1 * qualityConfig.glowIntensity}) 360deg)
          `,
          filter: 'blur(60px)',
          contentVisibility: qualityConfig.contentVisibility ? 'auto' : 'visible',
          contain: qualityConfig.contentVisibility ? 'content' : 'none',
        }}
        animate={!isPaused && isVisible ? {
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Noise overlay with reduced motion support */}
      {qualityConfig.shadowLayers >= 2 && (
        <div 
          className="absolute inset-0 opacity-[var(--noise-opacity)]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
};