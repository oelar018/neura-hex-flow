import React from "react";
import { AlertCircle, Search, MessageCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

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
    <section id="problem" className="py-24 bg-[#0A0A0A]">
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
              <div
                key={index}
                className="text-center space-y-4 p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-red-500/10">
                  <Icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="text-neutral-300 text-sm">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};