import React from "react";
import { SectionHeading } from "./SectionHeading";

export const Landscape: React.FC = () => {
  return (
    <section id="landscape" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Market Position"
          title="A unique position in the conversational AI landscape"
          subtitle="High conversational usability meets broad applicability"
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-900/40 rounded-2xl p-8 border border-white/10 mb-8">
            <div className="aspect-video bg-neutral-800/60 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-sm text-neutral-400 mb-2">Market Positioning Chart</div>
                <div className="text-xs text-neutral-500">
                  Conversational Usability × Use Case Specialization
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-3">
                Neura AI occupies the high-value quadrant
              </h3>
              <p className="text-neutral-300 text-sm">
                Most tools focus on post-meeting summaries or require external hardware. 
                We combine seamless integration with broad productivity applications.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-neutral-900/30 border border-white/5">
              <h4 className="font-semibold text-white mb-2">Meeting Tools</h4>
              <p className="text-xs text-neutral-400">
                Otter.ai, Avoma, Read.ai
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Post-conversation only
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-neutral-900/30 border border-white/5">
              <h4 className="font-semibold text-white mb-2">Hardware-Based</h4>
              <p className="text-xs text-neutral-400">
                PLAUD.AI, specialized devices
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Limited accessibility
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/20">
              <h4 className="font-semibold text-white mb-2">Neura AI</h4>
              <p className="text-xs text-neutral-400">
                Real-time, software-only
              </p>
              <p className="text-xs text-green-400 mt-2">
                Broad + accessible
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};