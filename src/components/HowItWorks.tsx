import React from "react";
import { Ear, Brain, MessageSquare } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const HowItWorks: React.FC = () => {
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
    <section id="how" className="py-24 bg-[#0A0A0A]">
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
                <div
                  key={index}
                  className="relative text-center space-y-4 p-8 rounded-2xl bg-neutral-900/40 border border-white/5"
                >
                  <div className="absolute -top-4 left-8 bg-[#0A0A0A] px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-mono text-neutral-400">{step.step}</span>
                  </div>
                  
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-white/5 mb-6">
                    <Icon className="w-8 h-8 text-white/80" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-neutral-300">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/60 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-neutral-300">No manual prompting</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};