import React from "react";
import { Zap, Filter, Settings, Mic, Type } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Badge } from "./ui/badge";

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
    <section id="solution" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="The Solution"
          title="AI that delivers answers without disrupting conversation"
          subtitle="Neura AI seamlessly provides insights so you stay in the flow"
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <p className="text-lg text-neutral-300">
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
            
            <div className="bg-neutral-900/60 rounded-2xl p-8 border border-white/10">
              <div className="text-sm text-neutral-400 mb-2">Neura AI suggests:</div>
              <div className="text-white font-medium">
                "The third investment scenario presents the highest yield of 23.5%. 
                Consider the risk factors we discussed in yesterday's email."
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center space-y-4 p-6 rounded-2xl bg-neutral-900/40 border border-white/5"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-white/5">
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};