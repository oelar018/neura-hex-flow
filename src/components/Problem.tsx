import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Search, MessageCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { MotionSection, MotionItem } from "./ui/MotionSection";
import { GlassCard } from "./ui/GlassCard";

export const Problem: React.FC = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "Caught off guard",
      description: "You're hit with a tricky question during a meeting and unsure how to respond."
    },
    {
      icon: Search,
      title: "Scrambling to research",
      description: "You're trying to look up information while keeping up with the conversation."
    },
    {
      icon: MessageCircle,
      title: "Losing the thread",
      description: "By the time you get your thoughts together, the conversation has moved on."
    }
  ];

  return (
    <MotionSection id="problem" className="bg-gradient-aurora">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="The Challenge"
          title="It's hard to keep up when you're lost in conversation"
          subtitle="We've all been there—caught off guard with no time to think"
        />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <MotionItem key={index}>
                <GlassCard className="text-center space-y-4 p-6">
                  <motion.div 
                    className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-destructive/10"
                    animate={{ 
                      scale: [1, 1.05, 1] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3 
                    }}
                  >
                    <Icon className="w-6 h-6 text-destructive" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {problem.title}
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    {problem.description}
                  </p>
                </GlassCard>
              </MotionItem>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};