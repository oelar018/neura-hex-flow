import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Ear, Brain, MessageSquare } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { MotionSection, MotionItem } from "./ui/MotionSection";
import { GlassCard } from "./ui/GlassCard";
import { getQualityConfig } from "../config/visual";

export const HowItWorks: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPaused, setIsPaused] = useState(false);
  const qualityConfig = getQualityConfig();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const steps = [
    {
      icon: Ear,
      title: "Listen & Detect",
      description: "Identifies key topics and context from your conversation",
      step: "01"
    },
    {
      icon: Brain,
      title: "Retrieve & Reason",
      description: "Connects relevant information from your emails, notes, and prior meetings",
      step: "02"
    },
    {
      icon: MessageSquare,
      title: "Suggest & Deliver",
      description: "Provides 1-2 line, action-ready suggestions in real-time",
      step: "03"
    }
  ];

  return (
    <MotionSection 
      ref={ref}
      id="how" 
      className="bg-gradient-aurora"
      style={{ 
        contentVisibility: qualityConfig.contentVisibility ? 'auto' : 'visible',
        contain: qualityConfig.contentVisibility ? 'content' : 'none'
      }}
    >
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="Three steps to conversational intelligence"
          subtitle="No manual prompting required—just natural conversation"
        />
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <MotionItem key={index}>
                  <GlassCard className="relative text-center space-y-4 p-8">
                    <motion.div
                      className="absolute -top-4 left-8 bg-background px-3 py-1 rounded-full border border-glass-border"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={isInView && !isPaused ? { scale: 1, rotate: 0 } : false}
                      transition={{ 
                        delay: index * 0.2, 
                        type: qualityConfig.animationDuration <= 0.25 ? "tween" : "spring",
                        duration: qualityConfig.animationDuration 
                      }}
                    >
                      <span className="text-xs font-mono text-foreground-muted">{step.step}</span>
                    </motion.div>
                    
                    <motion.div 
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-primary/10 mb-6"
                      animate={isInView && !isPaused ? { 
                        scale: [1, 1.05, 1] 
                      } : false}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3 
                      }}
                    >
                      <Icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-foreground-muted">
                      {step.description}
                    </p>
                  </GlassCard>
                </MotionItem>
              );
            })}
          </div>
          
          <MotionItem>
            <div className="text-center mt-12">
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20"
                animate={isInView && !isPaused ? { opacity: [0.7, 1, 0.7] } : false}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm text-success">No manual prompting</span>
              </motion.div>
            </div>
          </MotionItem>
        </div>
      </div>
    </MotionSection>
  );
};