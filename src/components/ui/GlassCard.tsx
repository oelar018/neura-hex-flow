import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-2xl backdrop-blur-xl",
          "bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.08]",
          "border border-white/[0.08]",
          "shadow-lg shadow-black/20",
          hover && "transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10",
          glow && "shadow-2xl shadow-primary/20",
          noise && "glass-noise",
          className
        )}
        whileHover={hover ? {
          boxShadow: "0 25px 50px -12px rgba(0, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        } : undefined}
        onClick={onClick}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] pointer-events-none" />
        
        {/* Border gradient overlay */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            padding: "1px"
          }}
        />
        
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };