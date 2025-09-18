import React from "react";
import { Shield, Lock, Eye, Users } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const Security: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Opt-in Storage Only",
      description: "We only store data when you explicitly choose to enable it for personalization"
    },
    {
      icon: Lock,
      title: "SOC2-Ready Infrastructure",
      description: "Enterprise-grade security posture with compliance frameworks in place"
    },
    {
      icon: Eye,
      title: "Data Minimization",
      description: "We collect and process only the minimum data necessary for functionality"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Granular permissions ensure team members only access what they need"
    }
  ];

  return (
    <section id="security" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Security & Privacy"
          title="Built with privacy at the core"
          subtitle="Enterprise-grade security without compromising usability"
        />
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-neutral-900/40 border border-white/5"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 flex-shrink-0">
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-300 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-semibold text-white mb-2">
              Global Compliance Ready
            </h3>
            <p className="text-neutral-300 text-sm">
              PIPL-ready deployment path for China market entry and international expansion
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};