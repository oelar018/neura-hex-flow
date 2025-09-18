import React from "react";
import { Hospital, Database, Calendar } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const Enterprise: React.FC = () => {
  return (
    <section id="enterprise" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Enterprise"
          title="Healthcare pilot validates enterprise potential"
          subtitle="Real-world deployment with leading medical institutions"
        />
        
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Hospital className="w-6 h-6 text-white/80" />
                  <h3 className="text-lg font-semibold text-white">
                    Hospital Pilot Program
                  </h3>
                </div>
                
                <p className="text-neutral-300 mb-4">
                  9-month contract with Wuhan General Hospital for diagnostic AI, 
                  with plans to scale across 6 hospitals in the network.
                </p>
                
                <div className="text-sm text-neutral-400">
                  Pilot success metrics will drive expansion to additional departments and institutions.
                </div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 font-semibold text-sm">
                  Active Partnership • Scaling in Progress
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-white mb-4">
                Enterprise Features
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/30 border border-white/5">
                  <Database className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-white text-sm">
                      Secure Self-Hosted Option
                    </h5>
                    <p className="text-xs text-neutral-400 mt-1">
                      Full data control with on-premises deployment
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/30 border border-white/5">
                  <Calendar className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-white text-sm">
                      EMR Integration Roadmap
                    </h5>
                    <p className="text-xs text-neutral-400 mt-1">
                      Scheduling, referrals, and prescription automation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/30 border border-white/5">
                  <Hospital className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-white text-sm">
                      Specialized Models
                    </h5>
                    <p className="text-xs text-neutral-400 mt-1">
                      Fine-tuned for medical diagnostics and terminology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};