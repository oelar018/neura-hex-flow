import React from "react";
import { Mail, Calendar, MessageSquare, Users, FileText, Database } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Badge } from "./ui/badge";

export const Integrations: React.FC = () => {
  const integrations = [
    {
      name: "Gmail",
      icon: Mail,
      status: "coming-soon"
    },
    {
      name: "Calendar",
      icon: Calendar,
      status: "coming-soon"
    },
    {
      name: "Slack",
      icon: MessageSquare,
      status: "coming-soon"
    },
    {
      name: "Teams",
      icon: Users,
      status: "coming-soon"
    },
    {
      name: "Notion",
      icon: FileText,
      status: "coming-soon"
    },
    {
      name: "Drive",
      icon: Database,
      status: "coming-soon"
    }
  ];

  return (
    <section id="integrations" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Integrations"
          title="Connect your favorite tools"
          subtitle="Seamless integration with the apps you already use"
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div
                  key={index}
                  className="relative p-6 rounded-2xl bg-neutral-900/40 border border-white/10 hover:border-white/20 transition-colors text-center group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-white/5 mb-4 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2">
                    {integration.name}
                  </h3>
                  
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-neutral-400 text-sm">
              More integrations coming based on user feedback.{" "}
              <a 
                href="#contact" 
                className="text-white hover:text-white/80 underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Let us know what you need
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};