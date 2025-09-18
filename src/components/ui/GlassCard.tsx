import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getQualityConfig } from '@/config/visual';

interface GlassCardProps {
  className?: string;
  hover?: boolean;
  glow?: boolean;
  noise?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = false, noise = true, children, onClick }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const qualityConfig = getQualityConfig();
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-2xl",
          qualityConfig.useBackdropBlur ? "backdrop-blur-xl" : "",
          "bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.08]",
          !qualityConfig.useBackdropBlur && "bg-background/80",
          "border border-white/[0.08]",
          qualityConfig.shadowLayers >= 1 && "shadow-lg shadow-black/20",
          hover && "transition-all duration-300",
          hover && isHovered && "scale-[1.01]",
          hover && isHovered && qualityConfig.shadowLayers >= 2 && "shadow-xl shadow-primary/10",
          glow && qualityConfig.shadowLayers >= 3 && "shadow-2xl shadow-primary/20",
          noise && qualityConfig.shadowLayers >= 2 && "glass-noise",
          className
        )}
        style={{
          contentVisibility: qualityConfig.contentVisibility ? 'auto' : 'visible',
          contain: qualityConfig.contentVisibility ? 'content' : 'none',
          willChange: isHovered && hover ? 'transform' : 'auto',
        }}
        whileHover={hover && qualityConfig.shadowLayers >= 2 ? {
          boxShadow: "0 25px 50px -12px rgba(0, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        } : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Inner glow effect - quality aware */}
        {qualityConfig.glowIntensity > 0.8 && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] pointer-events-none" />
        )}
        
        {/* Border gradient overlay - quality aware */}
        {qualityConfig.shadowLayers >= 2 && (
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              padding: "1px"
            }}
          />
        )}
        
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };