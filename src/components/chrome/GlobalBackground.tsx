import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export const GlobalBackground: React.FC = () => {
  const scrollProgress = useScrollProgress();

  // Update CSS variables based on scroll progress
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-intensity', scrollProgress.toString());
    root.style.setProperty('--glass-alpha', (0.6 + scrollProgress * 0.4).toString());
  }, [scrollProgress]);

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
              hsl(var(--brand-aurora-1) / 0.1) 0deg,
              hsl(var(--brand-aurora-2) / 0.05) 120deg,
              hsl(var(--brand-aurora-3) / 0.08) 240deg,
              hsl(var(--brand-aurora-1) / 0.1) 360deg)
          `,
          filter: 'blur(60px)',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Noise overlay with reduced motion support */}
      <div 
        className="absolute inset-0 opacity-[var(--noise-opacity)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};