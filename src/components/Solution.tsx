import React from "react";
import { motion } from "framer-motion";
import { Zap, Filter, Settings, Mic, Type } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Badge } from "./ui/badge";
import { MotionSection, MotionItem } from "./ui/MotionSection";
import { GlassCard } from "./ui/GlassCard";

export const Solution: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Concise, fact-based insights",
      description: "Get exactly what you need, when you need it"
    },
    {
      icon: Filter,
      title: "Filters to what's relevant",
      description: "Cuts through noise to deliver what matters most"
    },
    {
      icon: Settings,
      title: "Adapts to your setting",
      description: "Works for meetings, sales, negotiations, and more"
    }
  ];

  return (
    <MotionSection id="solution" className="bg-gradient-aurora" gradient>
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="The Solution"
          title="AI that delivers answers without disrupting conversation"
          subtitle="Neura AI seamlessly provides insights so you stay in the flow"
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <MotionItem>
              <div className="space-y-6">
                <p className="text-lg text-foreground-muted">
                  Neura AI works in the background, listening and understanding context 
                  to deliver relevant, actionable insights without requiring typing or prompting.
                </p>
                
                <div className="flex gap-3">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Mode
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Voice Mode
                  </Badge>
                </div>
              </div>
            </MotionItem>
            
            <MotionItem>
              <GlassCard className="p-8">
                <div className="text-sm text-foreground-muted mb-2">Neura AI suggests:</div>
                <div className="text-foreground font-medium">
                  "The third investment scenario presents the highest yield of 23.5%. 
                  Consider the risk factors we discussed in yesterday's email."
                </div>
              </GlassCard>
            </MotionItem>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionItem key={index}>
                  <GlassCard className="text-center space-y-4 p-6 h-full">
                    <motion.div 
                      className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-primary/10"
                      animate={{ 
                        y: [0, -2, 0] 
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.4 
                      }}
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-foreground-muted text-sm">
                      {feature.description}
                    </p>
                  </GlassCard>
                </MotionItem>
              );
            })}
          </div>
        </div>
      </div>
    </MotionSection>
  );
};