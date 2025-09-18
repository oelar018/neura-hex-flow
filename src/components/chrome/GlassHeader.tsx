import React from "react";
import { motion } from "framer-motion";
import { scrollToId } from "@/utils/scroll";
import { useHeroScrollProgress } from "@/hooks/useScrollProgress";
import { getQualityConfig } from "../../config/visual";

export const GlassHeader: React.FC = () => {
  const heroProgress = useHeroScrollProgress();
  const qualityConfig = getQualityConfig();
  
  const navItems = [
    { label: "Problem", href: "#problem" },
    { label: "Solution", href: "#solution" },
    { label: "How It Works", href: "#how" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#waitlist" }
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: `rgba(10, 10, 10, ${Math.min(heroProgress * 1.2, 0.9)})`,
        backdropFilter: qualityConfig.useBackdropBlur 
          ? `blur(${heroProgress * 20}px)` 
          : 'none',
        borderBottom: `1px solid rgba(255, 255, 255, ${heroProgress * 0.1})`
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: heroProgress > 0.1 
          ? "0 8px 32px rgba(0, 255, 255, 0.1)" 
          : "none"
      }}
      transition={{ 
        duration: qualityConfig.animationDuration,
        type: qualityConfig.animationDuration <= 0.25 ? "tween" : "spring"
      }}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="text-foreground font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ 
              type: qualityConfig.animationDuration <= 0.25 ? "tween" : "spring", 
              stiffness: 400 
            }}
          >
            Neura AI
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors relative"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(item.href.substring(1));
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: qualityConfig.animationDuration * 0.67 }}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </nav>
    </motion.header>
  );
};