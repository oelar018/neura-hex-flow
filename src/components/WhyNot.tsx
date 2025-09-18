import React from "react";
import { Check, X } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const WhyNot: React.FC = () => {
  const whatItDoes = [
    "Frees up mental bandwidth by handling facts, summaries, and calculations",
    "Serves as a memory tool, recalling details from earlier conversations",
    "Interprets ambiguous input and fills knowledge gaps",
    "Enhances social fluency with context-aware phrasing"
  ];

  const whatItDoesnt = [
    "Replace humans leading conversations",
    "Replace virtual assistants like Siri or ChatGPT", 
    "Require typing, toggling, or manual searching during dialogue",
    "Store conversational data without explicit user consent"
  ];

  return (
    <section id="comparison" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Not a Replacement"
          title="Neura AI enhances conversations, it doesn't replace them"
          subtitle="Designed to complement your natural conversation style"
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                What this does
              </h3>
              
              <ul className="space-y-4">
                {whatItDoes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                What this doesn't do
              </h3>
              
              <ul className="space-y-4">
                {whatItDoesnt.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};