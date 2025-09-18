import React from "react";
import { Calendar, Rocket, TrendingUp, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const Roadmap: React.FC = () => {
  const roadmapData = [
    {
      quarter: "Q3 2025",
      title: "Re-launch & Infrastructure",
      icon: Rocket,
      items: [
        "App Store re-launch with premium tier",
        "PIPL-compliant infrastructure for China",
        "Hospital pilot program launch"
      ],
      status: "in-progress"
    },
    {
      quarter: "Q4 2025", 
      title: "Scale & Growth",
      icon: TrendingUp,
      items: [
        "Paid advertising to reach 500K+ installs",
        "Pilot results evaluation",
        "Advanced conversation analytics"
      ],
      status: "planned"
    },
    {
      quarter: "Q1 2026",
      title: "Advanced AI & Expansion", 
      icon: Zap,
      items: [
        "Next-gen AI models integration",
        "Hospital network expansion (2 of 6 hospitals)",
        "Enhanced premium features"
      ],
      status: "planned"
    }
  ];

  return (
    <section id="roadmap" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Roadmap"
          title="Building the future of conversational AI"
          subtitle="Our journey from pilot to platform"
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-0.5 top-16 bottom-0 w-0.5 bg-white/10"></div>
            
            <div className="space-y-12">
              {roadmapData.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <div
                    key={index}
                    className={`relative flex items-start gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-white/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white/80" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 ml-16 md:ml-0">
                      <div
                        className={`p-6 rounded-2xl border transition-all duration-300 hover:border-white/20 ${
                          phase.status === "in-progress"
                            ? "bg-blue-500/10 border-blue-500/20"
                            : "bg-neutral-900/40 border-white/10"
                        } ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-sm font-mono text-neutral-400">
                            {phase.quarter}
                          </span>
                          {phase.status === "in-progress" && (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              In Progress
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {phase.title}
                        </h3>
                        
                        <ul className="space-y-2">
                          {phase.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-sm text-neutral-300 flex items-start gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};