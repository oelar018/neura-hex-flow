import React from "react";
import { 
  Briefcase, 
  Handshake, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Lightbulb, 
  MessageCircle, 
  Stethoscope 
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const UseCases: React.FC = () => {
  const useCases = [
    {
      icon: Briefcase,
      title: "Work Meetings",
      outcome: "Stay informed and contribute meaningfully to every discussion"
    },
    {
      icon: TrendingUp,
      title: "Sales",
      outcome: "Access customer insights and objection responses instantly"
    },
    {
      icon: Handshake,
      title: "Negotiations",
      outcome: "Get strategic talking points and leverage information"
    },
    {
      icon: Users,
      title: "Hiring",
      outcome: "Ask better questions and evaluate candidates effectively"
    },
    {
      icon: GraduationCap,
      title: "Training",
      outcome: "Receive coaching tips and best practices in real-time"
    },
    {
      icon: Lightbulb,
      title: "Brainstorming",
      outcome: "Generate creative ideas and build on team concepts"
    },
    {
      icon: MessageCircle,
      title: "Debates",
      outcome: "Access supporting arguments and factual backing"
    },
    {
      icon: Stethoscope,
      title: "Diagnostics",
      outcome: "Get relevant medical insights and decision support"
    }
  ];

  return (
    <section id="use-cases" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Use Cases"
          title="Built for every conversation that matters"
          subtitle="From boardrooms to classrooms, Neura AI adapts to your context"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 mb-4 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-6 h-6 text-white/80" />
                </div>
                
                <h3 className="font-semibold text-white mb-2 text-sm">
                  {useCase.title}
                </h3>
                
                <p className="text-xs text-neutral-400">
                  {useCase.outcome}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};